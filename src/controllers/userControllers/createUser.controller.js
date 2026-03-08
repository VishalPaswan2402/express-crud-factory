import { generateJwtToken } from "../../utils/generateJwtToken.utils.js";
import { passwordHashing } from "../../utils/passwordHashing.utils.js";

const createUserController = (UserModel, userSecretConfig) => async (req, res) => {
    try {
        // validating input data.
        const { email, username, fullname, password, confirmPassword } = req.body;
        if (!email || !username || !fullname || !password || !confirmPassword) {
            return res.status(400).json({
                message: "Please fill all data correctly.",
                success: false
            });
        }
        // comparing password.
        if (password != confirmPassword) {
            return res.status(400).json({
                message: "Oops! Your passwords don't match.",
                success: false
            });
        }
        // finding if username or email already exist.
        const userExist = await UserModel.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        });
        if (userExist) {
            return res.status(400).json({
                message: "Looks like someone already registered with that username or email.",
                success: false
            });
        }
        // hash plain password.
        const hashedPassword = await passwordHashing.hashPassword(password, userSecretConfig.bcryptSecret);
        // saving data.
        const modelData = new UserModel({ ...req.body, password: hashedPassword });
        const data = await modelData.save();
        const savedData = data.toObject();
        delete savedData.password;
        // generate jwt token
        const token = generateJwtToken(savedData, userSecretConfig.jwtSecret);
        return res.status(201).json({
            data: savedData,
            token: token,
            message: "New user created successfully.",
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

export default createUserController;