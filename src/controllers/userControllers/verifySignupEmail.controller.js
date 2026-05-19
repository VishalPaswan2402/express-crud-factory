import { emailTokenGenerator } from "../../utils/emailTokenGenerator.utils.js";
import { generateJwtRefreshToken, generateJwtToken } from "../../utils/generateJwtToken.utils.js";
import { errorResponse, loginResponse, successResponse } from "../../utils/response.utils.js";
import { userAfterVerification } from "../../utils/userAfterVerification.utils.js";

const verifySignupEmailController = (UserModel, userSecretConfig, isLink) => async (req, res) => {
    try {
        let myToken = null;
        let user = null;
        if (isLink) {
            const { token } = req.body;
            if (!token) {
                return errorResponse(res, 400, "Verification token is missing.");
            }
            myToken = token;
            user = await UserModel.findOne({ verifyToken: token }).select("+verifyToken +jwtRefreshToken +verifyTokenType +verifyTokenExpires +destroyDataAfter +otpRequestCount +otpLastRequest");
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
            user = await UserModel.findOne({ email: email }).select("+verifyToken +jwtRefreshToken +verifyTokenType +verifyTokenExpires +destroyDataAfter +otpRequestCount +otpLastRequest");
            if (!user) {
                return errorResponse(res, 404, "User not found.");
            }
        }
        if (user.emailVerified) {
            return successResponse(res, 200, null, "Email is already verified.");
        }
        if (!user.destroyDataAfter || user.destroyDataAfter < Date.now()) {
            await UserModel.findByIdAndDelete(user._id);
            return errorResponse(res, 410, "Registration expired. Please sign up again.");
        }
        if (!user.verifyToken || !user.verifyTokenExpires || user.verifyTokenExpires < Date.now()) {
            return errorResponse(res, 410, `Your ${isLink ? "verification link" : "OTP"} has expired. Please request a new one.`);
        }
        if (!user.verifyTokenType || user.verifyTokenType !== "create_token") {
            return errorResponse(res, 410, `Your ${isLink ? "verification link" : "OTP"} is invalid. Please request a new one.`);
        }
        if (!isLink) {
            const isValidOtp = await emailTokenGenerator.compareOtp(myToken, user.verifyToken);
            if (!isValidOtp) {
                return errorResponse(res, 422, "Incorrect OTP. Please try again.");
            }
        }
        let savedData = await userAfterVerification(user);
        delete savedData.jwtRefreshToken;
        if (isLink) {
            return successResponse(res, 201, savedData, "Account created and email verified successfully.");
        }
        const refreshToken = generateJwtRefreshToken(savedData._id, userSecretConfig.jwtSecret);
        user.jwtRefreshToken = refreshToken;
        await user.save();
        const accessToken = generateJwtToken(savedData, userSecretConfig.jwtSecret);
        return loginResponse(res, 201, savedData, accessToken, refreshToken, "Account created and email verified successfully.");
    }
    catch (error) {
        return errorResponse(res, 500, "Something went wrong. Please try again later.");
    }
};

export default verifySignupEmailController;