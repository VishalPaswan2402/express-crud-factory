export default function postArticleFactoryValidator(UserModel, PostModel, configOptions = {}) {
    if (!UserModel) {
        throw new Error(
            "Missing 'UserModel': please provide a valid User model to initialize postArticleFactory."
        );
    }
    if (!PostModel) {
        throw new Error(
            "Missing 'PostModel': please provide a valid Post model to initialize postArticleFactory."
        );
    }
    const { jwtSecret, bcryptSecret } = configOptions;
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
}