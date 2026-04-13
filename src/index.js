import { jsonErrorHandler } from './middlewares/jsonErrorHandler.middleware.js';
import { loginSignupApi, postArticleAPI } from './routes/crud.routes.js';
import { connectDatabase } from './utils/connectDatabase.utils.js';
import { loginSignupFactoryConfigure, postArticleFactoryConfigure } from './validator/factory.configure.js';
import loginSignupFactoryValidator from './validator/loginSignupFactory.validator.js';
import postArticleFactoryValidator from './validator/postArticleFactory.validator.js';

// for new user account setup
function loginSignupFactory(UserModel, configOptions = {}, emailConfig = {}) {
    loginSignupFactoryValidator(UserModel, configOptions, emailConfig);
    const { userSecretConfig, emailSender, verifyMethod, emailTokenConfig } = loginSignupFactoryConfigure(configOptions, emailConfig);
    return loginSignupApi(UserModel, userSecretConfig, emailSender, verifyMethod, emailTokenConfig);
};

// for posting article.
function postArticleFactory(UserModel, PostModel, configOptions = {}) {
    postArticleFactoryValidator(UserModel, PostModel, configOptions);
    const userSecretConfig = postArticleFactoryConfigure(configOptions);
    return postArticleAPI(UserModel, PostModel, userSecretConfig);
};

export { loginSignupFactory, postArticleFactory, jsonErrorHandler, connectDatabase };
