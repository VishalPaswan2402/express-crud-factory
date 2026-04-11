import { emailTokenGenerator } from "../../utils/emailTokenGenerator.utils.js";
import { generateJwtToken } from "../../utils/generateJwtToken.utils.js";
import { errorResponse, loginResponse, successResponse } from "../../utils/response.utils.js";
import { userAfterVerification } from "../../utils/userAfterVerification.utils.js";

const verifySignupEmailController = (UserModel, userSecretConfig, isLink, emailTokenConfig) => async (req, res) => {
    try {
        let myToken = null;
        let myEmail = null;
        if (isLink) {
            const { token } = req.body;
            if (!token) {
                return errorResponse(res, 400, "Verification token is missing.");
            }
            const tokenData = emailTokenGenerator.emailDecryptToken(token, emailTokenConfig);
            if (!tokenData || tokenData.verifyType !== 1) {
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
        const savedData = await userAfterVerification(user);
        if (isLink) {
            return successResponse(res, 201, savedData, "Account created and email verified successfully.");
        }
        const jwtToken = generateJwtToken(savedData, userSecretConfig.jwtSecret);
        return loginResponse(res, 201, savedData, jwtToken, "Account created and email verified successfully.");
    }
    catch (error) {
        console.log("signup error :",error);
        return errorResponse(res, 500, "Something went wrong. Please try again later.");
    }
};

export default verifySignupEmailController;