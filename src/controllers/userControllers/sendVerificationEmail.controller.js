import { dataExpiryTime } from "../../utils/dataExpiryTime.utils.js";
import { errorResponse, successResponse } from "../../utils/response.utils.js";
import { validEmailRequest } from "../../utils/validEmailRequest.utils.js";
import { verificationMailSender } from "../../utils/verificationMailSender.utils.js";
import { verificationToken } from "../../utils/verificationToken.utils.js";

const sendVerificationEmailController = (UserModel, userSecretConfig, emailSender, verifyMethod, create) => async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return errorResponse(res, 400, "Email is required.");
        }
        const user = await UserModel.findOne({ email: email }).select("+destroyDataAfter +verifyToken +verifyTokenExpires +otpRequestCount +otpLastRequest");
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
        if (create === 3) {
            const loggedUser = req.loggedUser;
            if (!loggedUser || !user._id.equals(loggedUser.id)) {
                return errorResponse(res, 400, "User mismatch. Action not permitted.")
            }
        }
        if (!validEmailRequest(user)) {
            return errorResponse(res, 429, "OTP request limit exceeded. Please try again later.");
        }
        const generatedToken = await verificationToken.saveSendToken(verifyMethod, userSecretConfig, create);
        let verificationSave = generatedToken.saveToken;
        let verificationSend = generatedToken.sendToken;
        const otpCount = user.otpRequestCount + 1;
        if (otpCount == 3) {
            user.otpLastRequest = new Date();
        }
        user.otpRequestCount = otpCount;
        user.verifyToken = verificationSave;
        user.verifyTokenType = create === 1 ? "create_token" : create === 2 ? "recover_token" : "destroy_token";
        user.verifyTokenExpires = dataExpiryTime.otpLinkExpire(verifyMethod.otpLinkExpiryMinutes);
        await user.save();
        await verificationMailSender.sendEmail(emailSender, verifyMethod, user.email, create, user.fullname, verificationSend);
        const userData = {
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