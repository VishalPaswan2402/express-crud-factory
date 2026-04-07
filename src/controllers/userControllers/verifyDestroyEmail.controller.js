import { emailTokenGenerator } from "../../utils/emailTokenGenerator.utils.js";
import { errorResponse, successResponse } from "../../utils/response.utils.js";

const verifyDestroyEmailController = (UserModel, isLink) => async (req, res) => {
    try {
        const { userId } = req.params;
        let myToken = null;
        if (isLink) {
            const { token } = req.query;
            if (!token) {
                return errorResponse(res, 400, "Verification token is missing. Please check your email link.");
            }
            myToken = token;
        }
        else {
            const { otp } = req.body;
            if (!otp) {
                return errorResponse(res, 400, "OTP is required.");
            }
            myToken = otp;
        }
        const user = await UserModel.findById(userId).select("+verifyToken +verifyTokenExpires");
        if (!user) {
            return errorResponse(res, 404, "User not found.");
        }
        if (!user.isActive) {
            return errorResponse(res, 403, `Your account is blocked. Deletion is not allowed.`);
        }
        if (!user.verifyToken || !user.verifyTokenExpires || user.verifyTokenExpires < Date.now()) {
            return errorResponse(res, 410, `Your ${isLink ? "verification link" : "OTP"} has expired. Please request a new one.`);
        }
        if (isLink) {
            if (user.verifyToken !== myToken) {
                return errorResponse(res, 400, "This verification link is invalid. Please request a new one.");
            }
        }
        else {
            const isValidOtp = await emailTokenGenerator.compareOtp(myToken, user.verifyToken);
            if (!isValidOtp) {
                return errorResponse(res, 422, "Incorrect OTP. Please try again.");
            }
        }
        const deleteData = await UserModel.findByIdAndDelete(userId);
        const deletedData = {
            userId: userId,
            username: deleteData.username,
            fullname: deleteData.fullname,
            email: deleteData.email
        }
        return successResponse(res, 200, deletedData, "User deleted successfully.");
    }
    catch (error) {
        return errorResponse(res, 500, "Something went wrong. Please try again later.");
    }
}

export default verifyDestroyEmailController;