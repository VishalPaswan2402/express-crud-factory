import { authSecretConfig } from './config/authSecret.config.js';
import { loginSignupApi, postArticleAPI } from './routes/crud.routes.js';

// for new user account setup
function loginSignupFactory(UserModel, configOptions = {}) {
    const { jwtSecret = {}, bcryptSecret = {} } = configOptions;
    if (!UserModel) {
        throw new Error("UserModel is required to Login_Signup_Factory");
    }
    if (!jwtSecret || Object.keys(jwtSecret).length === 0) {
        throw new Error("Jwt secret is required to Login_Signup_Factory");
    }
    const userSecretConfig = authSecretConfig(jwtSecret, bcryptSecret);
    return loginSignupApi(UserModel, userSecretConfig);
};

// for posting article.
function postArticleFactory(UserModel, PostModel, configOptions = {}) {
    const { jwtSecret = {}, bcryptSecret = {} } = configOptions;
    if (!UserModel || !PostModel) {
        throw new Error("UserModel and PostModel is required to Post_Article_Factory.");
    }
    if (!jwtSecret || Object.keys(jwtSecret).length === 0) {
        throw new Error("Jwt secret is required to Post_Article_Factory.");
    }
    const userSecretConfig = authSecretConfig(jwtSecret, bcryptSecret);
    return postArticleAPI(UserModel, PostModel, userSecretConfig);
};

export { loginSignupFactory, postArticleFactory };
