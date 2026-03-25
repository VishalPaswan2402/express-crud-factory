import { emailTokenGenerator } from "../../utils/emailTokenGenerator.utils.js";
import { generateJwtToken } from "../../utils/generateJwtToken.utils.js";

const verifySignupOtp = (UserModel, userSecretConfig) => async (req, res) => {
    try {
        const { userId } = req.params;
        const { otp } = req.body;
        if (!otp || otp == "") {
            return res.status(400).json({
                message: "Please fill OTP correctly.",
                success: false
            });
        }
        // find user
        const user = await UserModel.findById(userId).select("+verifyToken +verifyTokenExpires +destroyDataAfter");
        if (!user) {
            return res.status(404).json({
                message: "Invalid request. Please signup again.",
                success: false
            });
        }
        // email verified
        if (user.emailVerified) {
            return res.status(200).json({
                message: "Email already verified.",
                success: true
            });
        }
        // check data expiry
        if (!user.destroyDataAfter || user.destroyDataAfter < Date.now()) {
            await UserModel.findByIdAndDelete(user._id);
            return res.status(400).json({
                message: "User is not registered, signup again.",
                success: false
            });
        }
        // check token validity
        if (!user.verifyToken || !user.verifyTokenExpires || user.verifyTokenExpires < Date.now()) {
            return res.status(400).json({
                message: "OTP expired, generate new OTP.",
                success: false
            });
        }
        // otp valid
        const isValidOtp = await emailTokenGenerator.compareOtp(otp, user.verifyToken);
        if (!isValidOtp) {
            return res.status(400).json({
                message: "Invalid, please enter correct OTP.",
                success: false
            });
        }
        // update user
        user.emailVerified = true;
        user.isActive = true;
        user.verifyToken = null;
        user.verifyTokenExpires = null;
        user.destroyDataAfter = null;
        const data = await user.save();
        // create response data
        const savedData = data.toObject();
        delete savedData.password;
        delete savedData.verifyToken;
        delete savedData.verifyTokenExpires;
        delete savedData.destroyDataAfter;
        // generate jwt token
        const jwtToken = generateJwtToken(savedData, userSecretConfig.jwtSecret);
        return res.status(201).json({
            data: savedData,
            token: jwtToken,
            message: "Email verified and account created successfully.",
            success: true
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Oops! Something went wrong while verifying OTP.Try again.",
            success: false
        });
    }
}

export default verifySignupOtp;