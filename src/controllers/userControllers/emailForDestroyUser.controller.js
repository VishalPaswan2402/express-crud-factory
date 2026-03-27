import { dataExpiryTime } from "../../utils/dataExpiryTime.utils.js";
import { validEmailRequest } from "../../utils/validEmailRequest.utils.js";
import { verificationMailSender } from "../../utils/verificationMailSender.utils.js";
import { verificationToken } from "../../utils/verificationToken.utils.js";

const emailForDestroyUserController = (UserModel, userSecretConfig, emailSender, verifyMethod) => async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await UserModel.findById(userId).select("+verifyToken +verifyTokenExpires +otpRequestCount +otpLastRequest");
        if (!user) {
            return res.status(404).json({
                message: "Looks like that user doesn't exist in our system.",
                success: false
            });
        }
        if (!user.isActive) {
            return res.status(400).json({
                message: "Your account is blocked, you can't delete it.",
                success: false
            });
        }
        if (!user.emailVerified) {
            return res.status(400).json({
                message: "Email not verified, you can't delete it.",
                success: false
            });
        }
        if (!validEmailRequest(user)) {
            return res.status(429).json({
                message: "OTP request exceed, try again later.",
                success: false
            });
        }
        // generate link or otp
        const generatedToken = await verificationToken.saveSendToken(verifyMethod, userSecretConfig, false, user._id);
        let verificationSave = generatedToken.saveToken;
        let verificationSend = generatedToken.sendToken;
        // update user token 
        const otpCount = user.otpRequestCount + 1;
        if (otpCount == 3) {
            user.otpLastRequest = new Date();
        }
        user.otpRequestCount = otpCount;
        user.verifyToken = verificationSave;
        user.verifyTokenExpires = dataExpiryTime.otpLinkExpire(verifyMethod.otpLinkExpiryMinutes);
        await user.save();
        // send mail
        await verificationMailSender.sendEmail(emailSender, verifyMethod, user.email, false, user.fullname, verificationSend);
        // send userId for otp verify
        const userData = {
            userId: user._id,
            fullName: user.fullname,
            email: user.email
        };
        return res.status(200).json({
            data: userData,
            message: `Verification ${verifyMethod.usingLink ? "link" : "OTP"} sended to your email successfully.`,
            success: true
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Oops! Something went wrong while sending link.Try again later.",
            success: false
        });
    }
}

export default emailForDestroyUserController;