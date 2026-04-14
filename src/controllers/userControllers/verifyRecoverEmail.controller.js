import { emailTokenGenerator } from "../../utils/emailTokenGenerator.utils.js";
import { passwordHashing } from "../../utils/passwordHashing.utils.js";
import { errorResponse, successResponse } from "../../utils/response.utils.js";
import { userAfterVerification } from "../../utils/userAfterVerification.utils.js";

const verifyRecoverEmailController = (UserModel, isLink, userSecretConfig, emailTokenConfig) => async (req, res) => {
    try {
        let myEmail = null;
        let myToken = null;
        const { password, confirmPassword } = req.body;
        if (!password || !confirmPassword) {
            return errorResponse(res, 400, "Password and confirm password are required.");
        }
        if (!passwordHashing.securePassword(password)) {
            return errorResponse(res, 400, "Password must be at least 8 characters long and include uppercase, lowercase, a digit, and a special character.");
        }
        if (password !== confirmPassword) {
            return errorResponse(res, 422, "Password and confirm password must match.");
        }
        if (isLink) {
            const { token } = req.body;
            if (!token) {
                return errorResponse(res, 400, "Verification token is missing. Please check your email link.");
            }
            const tokenData = emailTokenGenerator.emailDecryptToken(token, emailTokenConfig);
            if (!tokenData || tokenData.verifyType !== 2) {
                return errorResponse(res, 410, "Your verification link has expired or invalid. Please request a new one.");
            }
            myToken = token;
            myEmail = tokenData.email;
        }
        else {
            const { otp, email } = req.body;
            if (!otp || !email) {
                return errorResponse(res, 400, "OTP and email is required.");
            }
            myToken = otp;
            myEmail = email;
        }
        const user = await UserModel.findOne({ email: myEmail }).select("+verifyToken +verifyTokenExpires +destroyDataAfter +otpRequestCount +otpLastRequest");
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
        const userData = {
            fullName: savedData.fullname,
            email: savedData.email
        };
        return successResponse(res, 200, userData, "Password updated successfully.");
    }
    catch (error) {
        return errorResponse(res, 500, "Something went wrong. Please try again later.");
    }
}

export default verifyRecoverEmailController;