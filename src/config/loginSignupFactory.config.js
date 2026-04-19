import { authSecretConfig } from "./authSecret.config.js";
import { emailVerificationConfig } from "./emailVerification.config.js";
import { nodemailerConfig } from "./nodemailer.config.js";

const loginSignupFactoryConfigure = (configOptions = {}, emailConfig = {}) => {
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

export default loginSignupFactoryConfigure;