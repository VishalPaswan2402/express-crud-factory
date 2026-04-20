import { authSecretConfig } from "./authSecret.config.js";
import { nodemailerConfig } from "./nodemailer.config.js";

const loginSignupFactoryConfigure = (configOptions = {}, emailConfig = {}) => {
    const { jwtSecret = {}, bcryptSecret = {} } = configOptions;
    const userSecretConfig = authSecretConfig(jwtSecret, bcryptSecret);
    const emailSender = nodemailerConfig(emailConfig.mailProvider);
    const verifyMethod = emailConfig.verifyMethod;
    return { userSecretConfig, emailSender, verifyMethod }
};

export default loginSignupFactoryConfigure;