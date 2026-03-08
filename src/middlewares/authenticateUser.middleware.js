import jwt from 'jsonwebtoken';

export const authenticateUser = (jwtSecret) => {
    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({
                    message: "Token is missing.",
                    success: false
                });
            }
            const token = authHeader.split(" ")[1];
            const decodedJwt = jwt.verify(token, jwtSecret.secret);
            req.loggedUser = decodedJwt;
            next();
        }
        catch (error) {
            return res.status(401).json({
                message: "Token is invalid. Please login again.",
                success: false
            });
        }
    };
};
