import mongoose from "mongoose"

const isValidUserPostId = (req, res, next) => {
    const { userId, postId } = req.params;
    if (!userId || !postId) {
        return res.status(400).json({
            message: "Oops! user ID or post ID is not found.",
            success: false
        });
    }
    const isValidUserId = mongoose.Types.ObjectId.isValid(userId);
    const isValidPostId = mongoose.Types.ObjectId.isValid(postId);
    if (!isValidUserId || !isValidPostId) {
        return res.status(400).json({
            message: "Invalid userID or postID.",
            success: false
        });
    }
    next();
}

export default isValidUserPostId;