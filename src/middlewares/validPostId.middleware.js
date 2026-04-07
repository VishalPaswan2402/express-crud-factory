import mongoose from "mongoose"
import { errorResponse } from "../utils/response.utils.js";

const isValidPostId = (req, res, next) => {
    const { postId } = req.params;
    if (!postId) {
        return errorResponse(res, 404, "Post ID not found.");
    }
    const isValidId = mongoose.Types.ObjectId.isValid(postId);
    if (!isValidId) {
        return errorResponse(res, 400, "Invalid post ID.");
    }
    next();
}

export default isValidPostId;