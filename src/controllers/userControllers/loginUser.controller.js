import { generateJwtToken } from "../../utils/generateJwtToken.utils.js";
import { passwordHashing } from "../../utils/passwordHashing.utils.js";

const loginUserController = (UserModel, userSecretConfig) => async (req, res) => {
    try {
        const { username, password } = req.body;
        // validate username and password
        if (!username || !password) {
            return res.status(400).json({
                message: "Both username and password is required.",
                success: false
            });
        }
        // find user by username
        const dataByUsername = await UserModel.findOne({ username: username }).select("+password +verifyTokenExpires");
        if (!dataByUsername) {
            return res.status(404).json({
                message: "Looks like that user doesn't exist in our system.",
                success: false
            });
        }
        // verify password
        let isValid = await passwordHashing.comparePassword(password, dataByUsername.password);
        if (!isValid) {
            return res.status(401).json({
                message: "Oops! you have entered incorrect password.",
                success: false
            })
        }
        if (!dataByUsername.emailVerified) {
            if (dataByUsername.verifyTokenExpires >= Date.now()) {
                return res.status(404).json({
                    message: "Oops! you have not verified your email yet.",
                    success: false
                })
            }
            else {
                await UserModel.findByIdAndDelete(dataByUsername._id);
                return res.status(404).json({
                    message: "Looks like that user doesn't exist in our system.",
                    success: false
                });
            }
        }
        const findData = dataByUsername.toObject();
        delete findData.password;
        delete findData.verifyTokenExpires;
        // generate jwt token 
        const token = generateJwtToken(findData, userSecretConfig.jwtSecret);
        return res.status(200).json({
            data: findData,
            token: token,
            message: "User logged-in successfully.",
            success: true
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Oops! Something went wrong while logging.",
            success: false
        });
    }
}

export default loginUserController;