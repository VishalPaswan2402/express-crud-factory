import jwt from 'jsonwebtoken';

export const generateJwtToken = (data, jwtSecret) => {
    const token = jwt.sign(
        {
            id: data._id,
            username: data.username
        },
        jwtSecret.secret,
        {
            expiresIn: jwtSecret.expireIn
        }
    );
    return token;
};