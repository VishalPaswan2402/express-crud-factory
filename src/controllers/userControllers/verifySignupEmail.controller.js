import { generateJwtToken } from "../../utils/generateJwtToken.utils.js";
import { userAfterVerification } from "../../utils/userAfterVerification.utils.js";

const verifySignupEmailController = (UserModel, userSecretConfig) => async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).json({
                message: "Token is missing",
                success: false
            });
        }
        // find user by token
        const user = await UserModel.findOne({ verifyToken: token }).select("+verifyToken +verifyTokenExpires +destroyDataAfter +otpRequestCount +otpLastRequest");
        if (!user) {
            return res.status(400).json({
                message: "Invalid token",
                success: false
            });
        }
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
        // check token expiry
        if (!user.verifyTokenExpires || user.verifyTokenExpires < Date.now()) {
            return res.status(400).json({
                message: "Token expired, generate new token.",
                success: false
            });
        }
        // // update user
        const savedData = await userAfterVerification(user);
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
            message: "Oops! Something went wrong while verifying email.Try again.",
            success: false
        });
    }
};

export default verifySignupEmailController;