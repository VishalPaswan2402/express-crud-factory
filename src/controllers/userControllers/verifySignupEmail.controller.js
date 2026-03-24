import { generateJwtToken } from "../../utils/generateJwtToken.utils.js";

const verifySignupEmail = (UserModel, userSecretConfig) => async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).json({
                message: "Token is missing",
                success: false
            });
        }
        // find user by token
        const user = await UserModel.findOne({ verifyToken: token }).select("+verifyToken +verifyTokenExpires");
        if (!user) {
            return res.status(400).json({
                message: "Invalid token",
                success: false
            });
        }
        if(user.emailVerified){
            return res.status(200).json({
                message: "Email already verified.",
                success: true
            });
        }
        // check expiry
        if (!user.verifyTokenExpires || user.verifyTokenExpires < Date.now()) {
            return res.status(400).json({
                message: "Token expired, generate new token.",
                success: false
            });
        }
        // update user
        user.emailVerified = true;
        user.isActive = true;
        user.verifyToken = null;
        user.verifyTokenExpires = null;
        const data = await user.save();
        // make response data
        const savedData = data.toObject();
        delete savedData.password;
        delete savedData.verifyToken;
        delete savedData.verifyTokenExpires;
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

export default verifySignupEmail;