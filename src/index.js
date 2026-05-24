import loginSignupFactoryConfigure from './config/loginSignupFactory.config.js';
import postArticleFactoryConfigure from './config/postArticleFactory.config.js';
import { jsonErrorHandler } from './middlewares/jsonErrorHandler.middleware.js';
import { checkUserExistByUsernameOrEmailApi, loginSignupApi, postArticleApi } from './routes/crud.routes.js';
import { connectDatabase } from './utils/connectDatabase.utils.js';
import loginSignupFactoryValidator from './validator/loginSignupFactory.validator.js';
import postArticleFactoryValidator from './validator/postArticleFactory.validator.js';

// for new user account setup
function loginSignupFactory(UserModel, ExpiredTokensModel, PostModel, configOptions = {}) {
    loginSignupFactoryValidator(UserModel, ExpiredTokensModel, PostModel, configOptions);
    const { userSecretConfig, emailSender, verifyMethod } = loginSignupFactoryConfigure(configOptions.secretsConfig, configOptions.emailConfig);
    return loginSignupApi(UserModel, ExpiredTokensModel, PostModel, userSecretConfig, emailSender, verifyMethod);
};

// for posting article.
function postArticleFactory(UserModel, ExpiredTokensModel, PostModel, configOptions = {}) {
    postArticleFactoryValidator(UserModel, ExpiredTokensModel, PostModel, configOptions);
    const userSecretConfig = postArticleFactoryConfigure(configOptions);
    return postArticleApi(UserModel, ExpiredTokensModel, PostModel, userSecretConfig);
};

// for checking user exist by username or email
function checkUserExistByUsernameOrEmail(UserModel) {
    if (!UserModel) {
        throw new Error(
            "Missing 'UserModel': please provide a valid User model to initialize checkUserExistByUsernameOrEmail."
        );
    }
    return checkUserExistByUsernameOrEmailApi(UserModel);
};

export { loginSignupFactory, postArticleFactory, jsonErrorHandler, connectDatabase, checkUserExistByUsernameOrEmail };
