import jwt from 'jsonwebtoken';

export const generateJwtToken = (data, jwtSecret) => {
    const token = jwt.sign(
        {
            id: data._id,
            username: data.username
        },
        jwtSecret.secret,
        {
            algorithm: "HS256",
            expiresIn: jwtSecret.expireIn
        }
    );
    return token;
};

export const generateJwtRefreshToken = (userId, jwtSecret) => {
    const token = jwt.sign(
        {
            id: userId
        },
        jwtSecret.refreshKey,
        {
            algorithm: "HS256",
            expiresIn: jwtSecret.refreshExpireIn
        }
    );
    return token;
}