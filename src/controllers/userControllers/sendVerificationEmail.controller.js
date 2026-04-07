import { dataExpiryTime } from "../../utils/dataExpiryTime.utils.js";
import { errorResponse, successResponse } from "../../utils/response.utils.js";
import { validEmailRequest } from "../../utils/validEmailRequest.utils.js";
import { verificationMailSender } from "../../utils/verificationMailSender.utils.js";
import { verificationToken } from "../../utils/verificationToken.utils.js";

const sendVerificationEmailController = (UserModel, userSecretConfig, emailSender, verifyMethod, create) => async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await UserModel.findById(userId).select("+destroyDataAfter +verifyToken +verifyTokenExpires +otpRequestCount +otpLastRequest");
        if (!user) {
            return errorResponse(res, 404, "User not found.");
        }
        if (create === 1) {
            if (user.emailVerified) {
                return successResponse(res, 200, null, "Email is already verified.");
            }
            if (!user.destroyDataAfter || user.destroyDataAfter < Date.now()) {
                await UserModel.findByIdAndDelete(user._id);
                return errorResponse(res, 410, "Verification time expired. Please sign up again.");
            }
        }
        else {
            if (!user.isActive) {
                return errorResponse(res, 403, `Your account is blocked. ${create === 2 ? "Recovery" : "Deletion"} is not allowed.`);
            }
            if (!user.emailVerified) {
                return errorResponse(res, 403, `Email not verified. You can't ${create === 2 ? "recover" : "delete"} the account.`);
            }
        }
        if (!validEmailRequest(user)) {
            return errorResponse(res, 429, "OTP request limit exceeded. Please try again later.");
        }
        const generatedToken = await verificationToken.saveSendToken(verifyMethod, userSecretConfig, create, user._id);
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
        await verificationMailSender.sendEmail(emailSender, verifyMethod, user.email, create, user.fullname, verificationSend);
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
};

export default sendVerificationEmailController;