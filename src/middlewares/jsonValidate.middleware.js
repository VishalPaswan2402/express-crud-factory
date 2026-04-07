import { errorResponse } from "../utils/response.utils.js";

const jsonValidate = (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return errorResponse(res, 400, "Request body cannot be empty.");
    }
    next();
};

export default jsonValidate;