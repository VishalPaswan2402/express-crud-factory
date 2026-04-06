import { dataExpiryTime } from "../../utils/dataExpiryTime.utils.js";
import { validEmailRequest } from "../../utils/validEmailRequest.utils.js";
import { verificationMailSender } from "../../utils/verificationMailSender.utils.js";
import { verificationToken } from "../../utils/verificationToken.utils.js";

const recoverPasswordController = (UserModel, userSecretConfig, emailSender, verifyMethod) => async (req, res) => {
    try {
        const { usernameOrEmail } = req.body;
        if (!usernameOrEmail) {
            return res.status(400).json({
                message: "Username or email is required.",
                success: false
            });
        }
        // find user data
        const user = await UserModel.findOne({
            $or: [
                { username: usernameOrEmail },
                { email: usernameOrEmail }
            ]
        }).select("+verifyToken +verifyTokenExpires +otpRequestCount +otpLastRequest +destroyDataAfter");
        // check data
        if (!user) {
            return res.status(404).json({
                message: "Looks like that user doesn't exist in our system.",
                success: false
            });
        }
        if (!user.emailVerified) {
            if (user.destroyDataAfter > Date.now()) {
                return res.status(400).json({
                    message: "Email not verified, please verify it.",
                    success: false
                });
            }
            else {
                await UserModel.findByIdAndDelete(user._id);
                return res.status(404).json({
                    message: "Looks like that user doesn't exist in our system.",
                    success: false
                });
            }
        }
        if (!user.isActive) {
            return res.status(400).json({
                message: "Your account is blocked, you can't recover it.",
                success: false
            });
        }
        if (!validEmailRequest(user)) {
            return res.status(429).json({
                message: "OTP request exceed, try again later.",
                success: false
            });
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
        return res.status(200).json({
            data: userData,
            message: `Verification ${verifyMethod.usingLink ? "link" : "OTP"} sended to your email successfully.`,
            success: true
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Oops! Something went wrong while saving new user.Try again later.",
            success: false
        });
    }
}

export default recoverPasswordController;