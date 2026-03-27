import { dataExpiryTime } from "../../utils/dataExpiryTime.utils.js";
import { validEmailRequest } from "../../utils/validEmailRequest.utils.js";
import { verificationMailSender } from "../../utils/verificationMailSender.utils.js";
import { verificationToken } from "../../utils/verificationToken.utils.js";

const sendVerificationEmailController = (UserModel, userSecretConfig, emailSender, verifyMethod) => async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await UserModel.findById(userId).select("+destroyDataAfter +verifyToken +verifyTokenExpires +otpRequestCount +otpLastRequest");
        if (!user) {
            return res.status(404).json({
                message: "Looks like that user doesn't exist in our system.",
                success: false
            });
        }
        if (user.emailVerified) {
            return res.status(200).json({
                message: "Email already verified.",
                success: true
            });
        }
        if (!user.destroyDataAfter || user.destroyDataAfter < Date.now()) {
            await UserModel.findByIdAndDelete(user._id);
            return res.status(400).json({
                message: "Verification time ended, signup again.",
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
        const generatedToken = await verificationToken.saveSendToken(verifyMethod, userSecretConfig, true, null);
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
        await verificationMailSender.sendEmail(emailSender, verifyMethod, user.email, true, user.fullname, verificationSend);
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
};

export default sendVerificationEmailController;