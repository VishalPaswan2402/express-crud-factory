import userRoutes from './user.routes.js';
import postRoutes from './post.routes.js';

function loginSignupApi(UserModel, userSecretConfig, emailSender, verifyMethod, emailTokenConfig) {
    return userRoutes(UserModel, userSecretConfig, emailSender, verifyMethod, emailTokenConfig);
}

function postArticleAPI(UserModel, PostModel, userSecretConfig) {
    return postRoutes(UserModel, PostModel, userSecretConfig);
}

export { loginSignupApi, postArticleAPI };
