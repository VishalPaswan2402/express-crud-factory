import { authSecretConfig } from './config/authSecret.config.js';
import { emailVerificationConfig } from './config/emailVerification.config.js';
import { nodemailerConfig } from './config/nodemailer.config.js';
import { jsonErrorHandler } from './middlewares/jsonErrorHandler.middleware.js';
import { loginSignupApi, postArticleAPI } from './routes/crud.routes.js';
import { connectDatabase } from './utils/connectDatabase.utils.js';

// for new user account setup
function loginSignupFactory(UserModel, configOptions = {}, emailConfig = {}) {
    const { jwtSecret = {}, bcryptSecret = {} } = configOptions;
    if (!UserModel) {
        throw new Error("UserModel is required to Login_Signup_Factory");
    }
    if (!jwtSecret
        || Object.keys(jwtSecret).length === 0) {
        throw new Error("Jwt secret is required to Login_Signup_Factory");
    }
    if (!jwtSecret.secretKey
        || jwtSecret.secretKey == "") {
        throw new Error("Jwt secretKey is required to Login_Signup_Factory");
    }
    if (!emailConfig
        || Object.keys(emailConfig).length === 0) {
        throw new Error("Email configuration is required.");
    }
    if (
        !emailConfig.mailProvider.host
        || emailConfig.mailProvider.host == ""
        || typeof (emailConfig.mailProvider.secure) !== "boolean"
        || !emailConfig.mailProvider.username
        || emailConfig.mailProvider.username == ""
        || !emailConfig.mailProvider.password
        || emailConfig.mailProvider.password == ""
        || !emailConfig.verifyMethod.projectName
        || emailConfig.verifyMethod.projectName == ""
        || typeof (emailConfig.verifyMethod.otpLinkExpiryMinutes) !== "number"
        || typeof (emailConfig.verifyMethod.unverifiedUserExpiryDays) !== "number"
        || typeof (emailConfig.verifyMethod.usingLink) !== "boolean"
    ) {
        throw new Error("Email configuration values are missing.");
    }
    if (emailConfig.verifyMethod.usingLink) {
        if (
            !emailConfig.verifyMethod.frontendBaseUrl
            || emailConfig.verifyMethod.frontendBaseUrl == ""
        ) {
            throw new Error("Email configuration frontendBaseUrl are missing.");
        }
        if (!emailConfig.verifyMethod.verifySecretKey
            || emailConfig.verifyMethod.verifySecretKey == ""
        ) {
            throw new Error("Email configuration verifySecretKey are missing.");
        }
    }
    if (emailConfig.verifyMethod.otpLinkExpiryMinutes <= 0) {
        throw new Error("OTP/link expiry minutes must be greater than or equal to 1.");
    }
    if (emailConfig.verifyMethod.unverifiedUserExpiryDays <= 0) {
        throw new Error("Unverified user expiry days must be greater than or equal to 1.");
    }
    const emailSender = nodemailerConfig(emailConfig.mailProvider);
    const userSecretConfig = authSecretConfig(jwtSecret, bcryptSecret);
    let emailTokenConfig = null
    if (emailConfig.verifyMethod.usingLink) {
        emailTokenConfig = emailVerificationConfig(emailConfig.verifyMethod.verifySecretKey, emailConfig.verifyMethod.otpLinkExpiryMinutes);
    }
    return loginSignupApi(UserModel, userSecretConfig, emailSender, emailConfig.verifyMethod, emailTokenConfig);
};

// for posting article.
function postArticleFactory(UserModel, PostModel, configOptions = {}) {
    const { jwtSecret = {}, bcryptSecret = {} } = configOptions;
    if (!UserModel
        || !PostModel) {
        throw new Error("UserModel and PostModel is required to Post_Article_Factory.");
    }
    if (!jwtSecret
        || Object.keys(jwtSecret).length === 0) {
        throw new Error("Jwt secret is required to Post_Article_Factory.");
    }
    if (!jwtSecret.secretKey
        || jwtSecret.secretKey == "") {
        throw new Error("Jwt secretKey is required to Post_Article_Factory");
    }
    const userSecretConfig = authSecretConfig(jwtSecret, bcryptSecret);
    return postArticleAPI(UserModel, PostModel, userSecretConfig);
};

export { loginSignupFactory, postArticleFactory, jsonErrorHandler, connectDatabase };
