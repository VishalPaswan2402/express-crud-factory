import { generateJwtToken } from "../../utils/generateJwtToken.utils.js";
import { passwordHashing } from "../../utils/passwordHashing.utils.js";
import { errorResponse, loginResponse, successResponse } from "../../utils/response.utils.js";

const loginUserController = (UserModel, userSecretConfig) => async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return errorResponse(res, 400, "Both username and password are required.");
        }
        const dataByUsername = await UserModel.findOne({ username: username }).select("+password +destroyDataAfter");
        if (!dataByUsername) {
            return errorResponse(res, 404, "User not found.");
        }
        let isValid = await passwordHashing.comparePassword(password, dataByUsername.password);
        if (!isValid) {
            return errorResponse(res, 401, "The password you entered is incorrect.");
        }
        if (!dataByUsername.emailVerified) {
            if (dataByUsername.destroyDataAfter > Date.now()) {
                const userData = {
                    userId: dataByUsername._id,
                    fullName: dataByUsername.fullName,
                    email: dataByUsername.email
                };
                return successResponse(res, 200, userData, "Please verify your email.");
            }
            else {
                await UserModel.findByIdAndDelete(dataByUsername._id);
                return errorResponse(res, 404, "User not found.");
            }
        }
        if (!dataByUsername.isActive) {
            return errorResponse(res, 403, "Your account is blocked. Please contact support.");
        }
        const findData = dataByUsername.toObject();
        delete findData.password;
        delete findData.destroyDataAfter;
        findData.articles = findData.articles.length;
        const token = generateJwtToken(findData, userSecretConfig.jwtSecret);
        return loginResponse(res, 200, findData, token, "User logged in successfully.");
    }
    catch (error) {
        return errorResponse(res, 500, "Something went wrong. Please try again later.");
    }
}

export default loginUserController;