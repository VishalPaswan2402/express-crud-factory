export const authSecretConfig = (jwtSecret, bcryptSecret) => {
    const configSecret = {
        jwtSecret: {
            secret: jwtSecret?.secretKey,
            expireIn: jwtSecret.expireInDays ? jwtSecret.expireInDays + "d" : "7d"
        },
        bcryptSecret: {
            salts: bcryptSecret.saltRounds ? bcryptSecret.saltRounds : 5
        }
    }
    return configSecret;
};