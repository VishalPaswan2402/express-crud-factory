import { passwordHashing } from "../../utils/password.utils.js";

const createUserController = (Model) => async (req, res) => {
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
        const userExist = await Model.findOne({
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
        const hashedPassword = await passwordHashing.hashPassword(password);
        // saving data.
        const modelData = new Model({ ...req.body, password: hashedPassword });
        const data = await modelData.save();
        const savedData=data.toObject();
        delete savedData.password;
        return res.status(200).json({
            data: savedData,
            message: "New user created successfully.",
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: "Oops! Something went wrong while saving new user.Try again later.",
            success: false
        });
    }
}

export default createUserController;