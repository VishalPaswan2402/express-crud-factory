import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/response.utils.js';

export const authenticateUser = (jwtSecret) => {
    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return errorResponse(res, 401, "Authentication token is missing.");
            }
            const token = authHeader.split(" ")[1];
            const decodedJwt = jwt.verify(token, jwtSecret.secret);
            req.loggedUser = decodedJwt;
            next();
        }
        catch (error) {
            return errorResponse(res, 401, "Invalid authentication token. Please log in again.");
        }
    };
};
