import mongoose from "mongoose"

const isValidPostId = (req, res, next) => {
    const { postId } = req.params;
    if (!postId) {
        return res.status(400).json({
            message: "Oops! post ID is not found.",
            success: false
        });
    }
    const isValidId = mongoose.Types.ObjectId.isValid(postId);
    if (!isValidId) {
        return res.status(400).json({
            message: "Invalid postID.",
            success: false
        });
    }
    next();
}

export default isValidPostId;