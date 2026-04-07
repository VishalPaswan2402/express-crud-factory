import { dataExpiryTime } from "../../utils/dataExpiryTime.utils.js";
import { errorResponse, successResponse } from "../../utils/response.utils.js";
import { validEmailRequest } from "../../utils/validEmailRequest.utils.js";
import { verificationMailSender } from "../../utils/verificationMailSender.utils.js";
import { verificationToken } from "../../utils/verificationToken.utils.js";

const recoverPasswordController = (UserModel, userSecretConfig, emailSender, verifyMethod) => async (req, res) => {
    try {
        const { usernameOrEmail } = req.body;
        if (!usernameOrEmail) {
            return errorResponse(res, 400, "Please provide a username or email.");
        }
        const user = await UserModel.findOne({
            $or: [
                { username: usernameOrEmail },
                { email: usernameOrEmail }
            ]
        }).select("+verifyToken +verifyTokenExpires +otpRequestCount +otpLastRequest +destroyDataAfter");
        if (!user) {
            return errorResponse(res, 404, "User not found.");
        }
        if (!user.emailVerified) {
            if (user.destroyDataAfter > Date.now()) {
                return errorResponse(res, 403, "Please verify your email.");
            }
            else {
                await UserModel.findByIdAndDelete(user._id);
                return errorResponse(res, 404, "User not found.");
            }
        }
        if (!user.isActive) {
            return errorResponse(res, 403, "Your account is blocked. Please contact support.");
        }
        if (!validEmailRequest(user)) {
            return errorResponse(res, 429, "OTP request limit exceeded. Please try again later.");
        }
        const generatedToken = await verificationToken.saveSendToken(verifyMethod, userSecretConfig, 2, user._id);
        let verificationSave = generatedToken.saveToken;
        let verificationSend = generatedToken.sendToken;
        const otpCount = user.otpRequestCount + 1;
        if (otpCount == 3) {
            user.otpLastRequest = new Date();
        }
        user.otpRequestCount = otpCount;
        user.verifyToken = verificationSave;
        user.verifyTokenExpires = dataExpiryTime.otpLinkExpire(verifyMethod.otpLinkExpiryMinutes);
        await user.save();
        await verificationMailSender.sendEmail(emailSender, verifyMethod, user.email, 2, user.fullname, verificationSend);
        const userData = {
            userId: user._id,
            fullName: user.fullname,
            email: user.email
        };
        return successResponse(res, 200, userData, `Verification ${verifyMethod.usingLink ? "link" : "OTP"} sent to your email successfully.`);
    }
    catch (error) {
        return errorResponse(res, 500, "Something went wrong. Please try again later.");
    }
}

export default recoverPasswordController;