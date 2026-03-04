import mongoose from "mongoose"

const isValidUserId = (req, res, next) => {
    console.log("Validating user id.");
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json({
            message: "Oops! user ID is not found.",
            success: false
        });
    }
    const isValidId = mongoose.Types.ObjectId.isValid(userId);
    if (!isValidId) {
        return res.status(400).json({
            message: "Invalid userID.",
            success: false
        });
    }
    next();
}

export default isValidUserId;