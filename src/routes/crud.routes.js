import userRoutes from './user.routes.js';
import postRoutes from './post.routes.js';
import checkUserExistRoutes from './checkUserExist.routes.js';

function loginSignupApi(UserModel, ExpiredTokensModel, PostModel, userSecretConfig, emailSender, verifyMethod) {
    return userRoutes(UserModel, ExpiredTokensModel, PostModel, userSecretConfig, emailSender, verifyMethod);
}

function postArticleApi(UserModel, ExpiredTokensModel, PostModel, userSecretConfig) {
    return postRoutes(UserModel, ExpiredTokensModel, PostModel, userSecretConfig);
}

function checkUserExistByUsernameOrEmailApi(UserModel) {
    return checkUserExistRoutes(UserModel);
}

export { loginSignupApi, postArticleApi, checkUserExistByUsernameOrEmailApi };
