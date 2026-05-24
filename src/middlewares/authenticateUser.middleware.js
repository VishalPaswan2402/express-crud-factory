import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/response.utils.js';

export const authenticateUser = (jwtSecret, ExpiredTokensModel) => {
    return async (req, res, next) => {
        try {
            let token = null;
            if (req.cookies?.accessToken) {
                token = req.cookies.accessToken;
            }
            else if (req.headers?.authorization) {
                const authHeader = req.headers.authorization;
                if (!authHeader.startsWith("Bearer ")) {
                    return errorResponse(res, 400, "Invalid authorization format.");
                }
                token = authHeader.split(" ")[1];
            }
            if (!token) {
                return errorResponse(res, 401, "Authentication token is missing.");
            }
            const expiredData = await ExpiredTokensModel.findOne({ accessToken: token });
            if (expiredData) {
                return errorResponse(res, 401, "Authentication token is expired. Please login again.");
            }
            const decodedJwt = jwt.verify(
                token,
                jwtSecret.secret,
                {
                    algorithms: ["HS256"]
                }
            );
            const expiryTime = new Date(decodedJwt.exp * 1000);
            req.loggedUser = decodedJwt;
            req.incomingAccessToken = { token, expiryTime };
            next();
        }
        catch (error) {
            if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
                return errorResponse(res, 401, "Invalid authentication token. Please log in again or refresh your token.");
            }
            return errorResponse(res, 500, "Something went wrong. Please try again later.");
        }
    };
};
