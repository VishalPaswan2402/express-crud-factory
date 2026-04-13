export default function postArticleFactoryValidator(UserModel, PostModel, configOptions = {}) {
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
}