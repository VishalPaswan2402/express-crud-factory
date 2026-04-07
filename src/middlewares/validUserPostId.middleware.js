import mongoose from "mongoose"
import { errorResponse } from "../utils/response.utils.js";

const isValidUserPostId = (req, res, next) => {
    const { userId, postId } = req.params;
    if (!userId || !postId) {
        return errorResponse(res, 404, "User ID or post ID not found.");
    }
    const isValidUserId = mongoose.Types.ObjectId.isValid(userId);
    const isValidPostId = mongoose.Types.ObjectId.isValid(postId);
    if (!isValidUserId || !isValidPostId) {
        return errorResponse(res, 400, "Invalid user ID or post ID.");
    }
    next();
}

export default isValidUserPostId;