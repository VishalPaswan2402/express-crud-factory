import { emailTokenGenerator } from "../../utils/emailTokenGenerator.utils.js";
import { passwordHashing } from "../../utils/passwordHashing.utils.js";
import { userAfterVerification } from "../../utils/userAfterVerification.utils.js";

const verifyRecoverEmailController = (UserModel, isLink, userSecretConfig) => async (req, res) => {
    try {
        const { userId } = req.params;
        let myToken = null;
        const { password, confirmPassword } = req.body;
        if (!password || !confirmPassword) {
            return res.status(400).json({
                message: "Please fill all new password correctly.",
                success: false
            });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Oops! Your passwords don't match.",
                success: false
            });
        }
        if (isLink) {
            const { token } = req.query;
            if (!token) {
                return res.status(400).json({
                    message: "Token is missing",
                    success: false
                });
            }
            myToken = token;
        }
        else {
            const { otp } = req.body;
            if (!otp || otp == "") {
                return res.status(400).json({
                    message: "Please fill OTP correctly.",
                    success: false
                });
            }
            myToken = otp;
        }
        // find user
        const user = await UserModel.findById(userId).select("+verifyToken +verifyTokenExpires +destroyDataAfter +otpRequestCount +otpLastRequest");
        if (!user) {
            return res.status(404).json({
                message: "Invalid request. Please signup again.",
                success: false
            });
        }
        if (!user.emailVerified) {
            return res.status(400).json({
                message: `Email not verified, you can't recover it.`,
                success: false
            });
        }
        if (!user.isActive) {
            return res.status(400).json({
                message: "Your account is blocked, you can't recover it.",
                success: false
            });
        }
        if (!user.verifyToken || !user.verifyTokenExpires || user.verifyTokenExpires < Date.now()) {
            return res.status(400).json({
                message: "OTP expired, generate new OTP.",
                success: false
            });
        }
        if (isLink) {
            if (myToken !== user.verifyToken) {
                return res.status(400).json({
                    message: "Invalid token, generate new token.",
                    success: false
                });
            }
        }
        else {
            const isValidOtp = await emailTokenGenerator.compareOtp(myToken, user.verifyToken);
            if (!isValidOtp) {
                return res.status(400).json({
                    message: "Invalid, please enter correct OTP.",
                    success: false
                });
            }
        }
        const hashPassword = await passwordHashing.hashPassword(password, userSecretConfig.bcryptSecret);
        user.password = hashPassword;
        const savedUser = await user.save();
        const savedData = await userAfterVerification(savedUser);
        return res.status(201).json({
            data: savedData,
            message: "Password updated successfully.",
            success: true
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Oops! Something went wrong while updating password.Try again.",
            success: false
        });
    }
}

export default verifyRecoverEmailController;