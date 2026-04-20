import loginSignupFactoryConfigure from './config/loginSignupFactory.config.js';
import postArticleFactoryConfigure from './config/postArticleFactory.config.js';
import { jsonErrorHandler } from './middlewares/jsonErrorHandler.middleware.js';
import { loginSignupApi, postArticleAPI } from './routes/crud.routes.js';
import { connectDatabase } from './utils/connectDatabase.utils.js';
import loginSignupFactoryValidator from './validator/loginSignupFactory.validator.js';
import postArticleFactoryValidator from './validator/postArticleFactory.validator.js';

// for new user account setup
function loginSignupFactory(UserModel, PostModel, configOptions = {}, emailConfig = {}) {
    loginSignupFactoryValidator(UserModel, PostModel, configOptions, emailConfig);
    const { userSecretConfig, emailSender, verifyMethod } = loginSignupFactoryConfigure(configOptions, emailConfig);
    return loginSignupApi(UserModel, PostModel, userSecretConfig, emailSender, verifyMethod);
};

// for posting article.
function postArticleFactory(UserModel, PostModel, configOptions = {}) {
    postArticleFactoryValidator(UserModel, PostModel, configOptions);
    const userSecretConfig = postArticleFactoryConfigure(configOptions);
    return postArticleAPI(UserModel, PostModel, userSecretConfig);
};

export { loginSignupFactory, postArticleFactory, jsonErrorHandler, connectDatabase };
