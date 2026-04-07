import { emailTokenGenerator } from "../../utils/emailTokenGenerator.utils.js";
import { passwordHashing } from "../../utils/passwordHashing.utils.js";
import { errorResponse, successResponse } from "../../utils/response.utils.js";
import { userAfterVerification } from "../../utils/userAfterVerification.utils.js";

const verifyRecoverEmailController = (UserModel, isLink, userSecretConfig) => async (req, res) => {
    try {
        const { userId } = req.params;
        let myToken = null;
        const { password, confirmPassword } = req.body;
        if (!password || !confirmPassword) {
            return errorResponse(res, 400, "Password and confirm password are required.");
        }
        if (password !== confirmPassword) {
            return errorResponse(res, 422, "Password and confirm password must match.");
        }
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
        const user = await UserModel.findById(userId).select("+verifyToken +verifyTokenExpires +destroyDataAfter +otpRequestCount +otpLastRequest");
        if (!user) {
            return errorResponse(res, 404, "User not found.");
        }
        if (!user.emailVerified) {
            return errorResponse(res, 403, `Email not verified. You can't recover the account.`);
        }
        if (!user.isActive) {
            return errorResponse(res, 403, `Your account is blocked. Recovery is not allowed.`);
        }
        if (!user.verifyToken || !user.verifyTokenExpires || user.verifyTokenExpires < Date.now()) {
            return errorResponse(res, 410, "Your OTP has expired. Please request a new one.");
        }
        if (isLink) {
            if (myToken !== user.verifyToken) {
                return errorResponse(res, 400, "This verification link is invalid. Please request a new one.");
            }
        }
        else {
            const isValidOtp = await emailTokenGenerator.compareOtp(myToken, user.verifyToken);
            if (!isValidOtp) {
                return errorResponse(res, 422, "Incorrect OTP. Please try again.");
            }
        }
        const hashPassword = await passwordHashing.hashPassword(password, userSecretConfig.bcryptSecret);
        user.password = hashPassword;
        const savedUser = await user.save();
        const savedData = await userAfterVerification(savedUser);
        return successResponse(res, 200, savedData, "Password updated successfully.");
    }
    catch (error) {
        return errorResponse(res, 500, "Something went wrong. Please try again later.");
    }
}

export default verifyRecoverEmailController;