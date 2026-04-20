import { emailTokenGenerator } from "../../utils/emailTokenGenerator.utils.js";
import { errorResponse, successResponse } from "../../utils/response.utils.js";

const verifyDestroyEmailController = (UserModel, PostModel, isLink) => async (req, res) => {
    try {
        let user = null;
        let myToken = null;
        if (isLink) {
            const { token } = req.body;
            if (!token) {
                return errorResponse(res, 400, "Verification token is missing.");
            }
            myToken = token;
            user = await UserModel.findOne({ verifyToken: token }).select("+verifyToken +verifyTokenType +verifyTokenExpires");
            if (!user) {
                return errorResponse(res, 404, "Invalid token. Please re-check it.")
            }
        }
        else {
            const { otp, email } = req.body;
            if (!otp || !email) {
                return errorResponse(res, 400, "OTP and email is required.");
            }
            myToken = otp;
            user = await UserModel.findOne({ email: email }).select("+verifyToken +verifyTokenType +verifyTokenExpires");
            if (!user) {
                return errorResponse(res, 404, "User not found.");
            }
        }
        if (!isLink) {
            const loggedUser = req.loggedUser;
            if (!loggedUser || !user._id.equals(loggedUser.id)) {
                return errorResponse(res, 400, "User mismatch. Action not permitted.")
            }
        }
        if (!user.isActive) {
            return errorResponse(res, 403, `Your account is blocked. Deletion is not allowed.`);
        }
        if (!user.verifyToken || !user.verifyTokenExpires || user.verifyTokenExpires < Date.now()) {
            return errorResponse(res, 410, `Your ${isLink ? "verification link" : "OTP"} has expired. Please request a new one.`);
        }
        if (!user.verifyTokenType || user.verifyTokenType !== "destroy_token") {
            return errorResponse(res, 410, `Your ${isLink ? "verification link" : "OTP"} is invalid. Please request a new one.`);
        }
        if (!isLink) {
            const isValidOtp = await emailTokenGenerator.compareOtp(myToken, user.verifyToken);
            if (!isValidOtp) {
                return errorResponse(res, 422, "Incorrect OTP. Please try again.");
            }
        }
        const allPosts = await PostModel.deleteMany({ author: user._id });
        const deleteData = await UserModel.findByIdAndDelete(user._id);
        const deletedData = {
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