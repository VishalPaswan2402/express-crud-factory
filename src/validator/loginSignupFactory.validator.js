export default function loginSignupFactoryValidator(UserModel, PostModel, configOptions = {}) {
    if (!UserModel) {
        throw new Error(
            "Missing 'UserModel': please provide a valid User model to initialize LoginSignupFactory."
        );
    }
    if (!PostModel) {
        throw new Error(
            "Missing 'PostModel': please provide a valid Post model to initialize LoginSignupFactory."
        );
    }
    const { secretsConfig, emailConfig } = configOptions;
    if (!secretsConfig || !emailConfig) {
        throw new Error(
            `Configuration error : ${!secretsConfig ? "secretsConfig" : ""}${!emailConfig ? "emailConfig" : ""} is missing.`
        );
    }
    const { jwtSecret, bcryptSecret } = secretsConfig;
    if (!jwtSecret) {
        throw new Error(
            "Configuration error : 'jwtSecret' is required in secretsConfig to enable authentication."
        );
    }
    if (jwtSecret.secretKey === undefined || typeof (jwtSecret.secretKey) !== "string" || jwtSecret.secretKey.trim() === "") {
        throw new Error(
            `Configuration error : ${jwtSecret.secretKey === undefined ? "missing" : "invalid"} 'jwtSecret.secretKey'. Add a valid secret key in secretsConfig.`
        );
    }
    if (jwtSecret.expireInDays !== undefined && (typeof (jwtSecret.expireInDays) !== "number" || jwtSecret.expireInDays < 1)) {
        throw new Error(
            "Configuration error: 'jwtSecret.expireInDays' must be a number greater than or equal to 1. Set a valid value in secretsConfig."
        );
    }
    if (bcryptSecret) {
        if (bcryptSecret.saltRounds === undefined || typeof (bcryptSecret.saltRounds) !== "number" || bcryptSecret.saltRounds < 5) {
            throw new Error(
                "Configuration error : invalid 'bcryptSecret.saltRounds' in secretsConfig. Please provide a valid number at least 5 to enable authentication."
            );
        }
    }
    const { mailProvider, verifyMethod } = emailConfig;
    if (!mailProvider || !verifyMethod) {
        throw new Error(
            `Configuration error : ${!mailProvider ? "mailProvider" : ""
            }${!verifyMethod ? "verifyMethod" : ""} is missing in emailConfig.`
        );
    }
    if (mailProvider.host === undefined || typeof (mailProvider.host) !== "string" || mailProvider.host.trim() === "") {
        throw new Error(
            `Configuration error : ${mailProvider.host === undefined ? "missing" : "Please provide a valid"} 'mailProvider.host' in emailConfig.`
        );
    }
    if (mailProvider.secure === undefined || typeof (mailProvider.secure) !== "boolean") {
        throw new Error(
            `Configuration error : ${mailProvider.secure === undefined ? "missing" : "invalid"} 'mailProvider.secure'. It must be a boolean (true or false) in emailConfig.`
        );
    }
    if (mailProvider.username === undefined || typeof (mailProvider.username) !== "string" || mailProvider.username.trim() === "") {
        throw new Error(
            `Configuration error : ${mailProvider.username === undefined ? "missing" : "invalid"} 'mailProvider.username'. Please provide a valid username in emailConfig.`
        );
    }
    if (mailProvider.password === undefined || typeof (mailProvider.password) !== "string" || mailProvider.password.trim() === "") {
        throw new Error(
            `Configuration error : ${mailProvider.password === undefined ? "missing" : "invalid"} 'mailProvider.password'. Please provide a valid password in emailConfig.`
        );
    }
    if (verifyMethod.projectName === undefined) {
        verifyMethod.projectName = "Express-Crud-Factory";
    }
    else if (typeof verifyMethod.projectName !== "string" || verifyMethod.projectName.trim() === "") {
        throw new Error(
            "Configuration error: invalid 'verifyMethod.projectName'. Please provide a valid projectName in emailConfig."
        );
    }
    if (verifyMethod.otpLinkExpiryMinutes === undefined || typeof verifyMethod.otpLinkExpiryMinutes !== "number" || verifyMethod.otpLinkExpiryMinutes < 1) {
        throw new Error(
            `Configuration error : ${verifyMethod.otpLinkExpiryMinutes === undefined ? "missing" : "invalid"} 'verifyMethod.otpLinkExpiryMinutes'. It must be a number greater than or equal to 1.`
        );
    }
    if (verifyMethod.unverifiedUserExpiryDays === undefined || typeof verifyMethod.unverifiedUserExpiryDays !== "number" || verifyMethod.unverifiedUserExpiryDays < 1) {
        throw new Error(
            `Configuration error : ${verifyMethod.unverifiedUserExpiryDays === undefined ? "missing" : "invalid"} 'verifyMethod.unverifiedUserExpiryDays'. It must be a number greater than or equal to 1.`
        );
    }
    if (verifyMethod.usingLink === undefined || typeof verifyMethod.usingLink !== "boolean") {
        throw new Error(
            `Configuration error : ${verifyMethod.usingLink === undefined ? "missing" : "invalid"} 'verifyMethod.usingLink'. It must be a boolean (true or false).`
        );
    }
    if (verifyMethod.usingLink) {
        if (verifyMethod.frontendBaseUrl === undefined || typeof verifyMethod.frontendBaseUrl !== "string" || verifyMethod.frontendBaseUrl.trim() === "") {
            throw new Error(
                `Configuration error : ${verifyMethod.frontendBaseUrl === undefined ? "missing" : "invalid"} 'verifyMethod.frontendBaseUrl'. Please provide a valid frontend base URL in emailConfig.`
            );
        }
    }
}