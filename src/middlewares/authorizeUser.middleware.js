import { errorResponse } from "../utils/response.utils.js";

export const authorizeUser = (req, res, next) => {
    try {
        const { userId } = req.params;
        const loggedId = req.loggedUser.id;
        if (loggedId != userId) {
            return errorResponse(res, 403, "You are not authorized to access this resource.");
        }
        next();
    }
    catch (error) {
        return errorResponse(res, 500, "Something went wrong. Please try again later.");
    }
};