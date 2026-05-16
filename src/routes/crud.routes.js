import userRoutes from './user.routes.js';
import postRoutes from './post.routes.js';
import checkUserExistRoutes from './checkUserExist.routes.js';

function loginSignupApi(UserModel, PostModel, userSecretConfig, emailSender, verifyMethod) {
    return userRoutes(UserModel, PostModel, userSecretConfig, emailSender, verifyMethod);
}

function postArticleApi(UserModel, PostModel, userSecretConfig) {
    return postRoutes(UserModel, PostModel, userSecretConfig);
}

function checkUserExistByUsernameOrEmailApi(UserModel) {
    return checkUserExistRoutes(UserModel);
}

export { loginSignupApi, postArticleApi, checkUserExistByUsernameOrEmailApi };
