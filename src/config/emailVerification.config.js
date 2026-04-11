export const emailVerificationConfig = (key, expire) => {
    const emailTokenConfig = {
        emailTokenSecret: {
            secret: key,
            expireIn: expire ? expire + "m" : "2m"
        }
    }
    return emailTokenConfig;
};