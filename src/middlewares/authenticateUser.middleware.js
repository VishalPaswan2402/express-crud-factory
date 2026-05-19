import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/response.utils.js';

export const authenticateUser = (jwtSecret) => {
    return (req, res, next) => {
        try {
            let token = null;
            if (req.cookies?.accessToken) {
                token = req.cookies.accessToken;
            }
            else if (req.headers?.authorization) {
                const authHeader = req.headers.authorization;
                if (!authHeader.startsWith("Bearer ")) {
                    return errorResponse(res, 401, "Invalid authorization format.");
                }
                token = authHeader.split(" ")[1];
            }
            if (!token) {
                return errorResponse(res, 401, "Authentication token is missing.");
            }
            const decodedJwt = jwt.verify(
                token,
                jwtSecret.secret,
                {
                    algorithms: ["HS256"]
                }
            );
            req.loggedUser = decodedJwt;
            next();
        }
        catch (error) {
            return errorResponse(res, 401, "Invalid authentication token. Please log in again or refresh your token.");
        }
    };
};
