import { authSecretConfig } from "./authSecret.config.js";

const postArticleFactoryConfigure = (configOptions = {}) => {
    const { jwtSecret = {}, bcryptSecret = {} } = configOptions;
    const userSecretConfig = authSecretConfig(jwtSecret, bcryptSecret);
    return userSecretConfig;
};

export default postArticleFactoryConfigure;