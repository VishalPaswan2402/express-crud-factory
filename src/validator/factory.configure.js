import { authSecretConfig } from "../config/authSecret.config.js";
import { emailVerificationConfig } from "../config/emailVerification.config.js";
import { nodemailerConfig } from "../config/nodemailer.config.js";

export const loginSignupFactoryConfigure = (configOptions = {}, emailConfig = {}) => {
    const { jwtSecret = {}, bcryptSecret = {} } = configOptions;
    const userSecretConfig = authSecretConfig(jwtSecret, bcryptSecret);
    const emailSender = nodemailerConfig(emailConfig.mailProvider);
    const verifyMethod = emailConfig.verifyMethod;
    let emailTokenConfig = null;
    if (emailConfig.verifyMethod.usingLink) {
        emailTokenConfig = emailVerificationConfig(emailConfig.verifyMethod.verifySecretKey, emailConfig.verifyMethod.otpLinkExpiryMinutes);
    }
    return { userSecretConfig, emailSender, verifyMethod, emailTokenConfig }
};

export const postArticleFactoryConfigure = (configOptions = {}) => {
    const { jwtSecret = {}, bcryptSecret = {} } = configOptions;
    const userSecretConfig = authSecretConfig(jwtSecret, bcryptSecret);
    return userSecretConfig;
};