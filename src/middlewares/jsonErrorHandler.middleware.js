import { errorResponse } from "../utils/response.utils.js";

export const jsonErrorHandler = (err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return errorResponse(res, 400, "Invalid JSON format in request body.");
    }
    next(err);
};