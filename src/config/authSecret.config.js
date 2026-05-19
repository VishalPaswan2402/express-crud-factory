export const authSecretConfig = (jwtSecret, bcryptSecret) => {
    const configSecret = {
        jwtSecret: {
            secret: jwtSecret?.secretKey,
            expireIn: jwtSecret.expireInHours ? jwtSecret.expireInHours + "h" : "1h",
            refreshKey: jwtSecret?.refreshKey,
            refreshExpireIn: jwtSecret.expireInDays ? jwtSecret.expireInDays + "d" : "7d"
        },
        bcryptSecret: {
            salts: bcryptSecret.saltRounds ? bcryptSecret.saltRounds : 10
        }
    }
    return configSecret;
};