export const authSecretConfig = (jwtSecret, bcryptSecret) => {
    const configSecret = {
        jwtSecret: {
            secret: jwtSecret.secretKey,
            expireIn: jwtSecret.expireIn || "7d"
        },
        bcryptSecret: {
            salts: bcryptSecret.saltRounds || 10
        }
    }
    return configSecret;
};