import { loginSignupApi, postArticleAPI } from './routes/crud.routes.js';

// for new user account setup
function loginSignupFactory(Model) {
    if (!Model) {
        throw new Error("Model must be provided to Login Signup Factory");
    }
    return loginSignupApi(Model);
}

// for posting article.
function postArticleFactory(Model1, Model2) {
    if (!Model1 || !Model2) {
        throw new Error("Model must be provided to Post Article Factory");
    }
    return postArticleAPI(Model1, Model2);
}

export { loginSignupFactory, postArticleFactory };
