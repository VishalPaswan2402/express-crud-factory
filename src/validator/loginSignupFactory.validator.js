export default function loginSignupFactoryValidator(UserModel, PostModel, configOptions = {}, emailConfig = {}) {
    const { jwtSecret = {}, bcryptSecret = {} } = configOptions;
    if (!UserModel) {
        throw new Error("UserModel is required to Login_Signup_Factory");
    }
    if (!PostModel) {
        throw new Error("PostModel is required to Login_Signup_Factory");
    }
    if (!jwtSecret || Object.keys(jwtSecret).length === 0) {
        throw new Error("Jwt secret is required to Login_Signup_Factory");
    }
    if (!jwtSecret.secretKey || jwtSecret.secretKey == "") {
        throw new Error("Jwt secretKey is required to Login_Signup_Factory");
    }
    if (!emailConfig || Object.keys(emailConfig).length === 0) {
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
        if (!emailConfig.verifyMethod.frontendBaseUrl || emailConfig.verifyMethod.frontendBaseUrl == ""
        ) {
            throw new Error("Email configuration frontendBaseUrl are missing.");
        }
        if (!emailConfig.verifyMethod.verifySecretKey || emailConfig.verifyMethod.verifySecretKey == ""
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
}