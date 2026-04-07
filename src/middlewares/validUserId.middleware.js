import mongoose from "mongoose"
import { errorResponse } from "../utils/response.utils.js";

const isValidUserId = (req, res, next) => {
    const { userId } = req.params;
    if (!userId) {
        return errorResponse(res, 404, "User ID not found.");
    }
    const isValidId = mongoose.Types.ObjectId.isValid(userId);
    if (!isValidId) {
        return errorResponse(res, 400, "Invalid user ID.");
    }
    next();
}

export default isValidUserId;