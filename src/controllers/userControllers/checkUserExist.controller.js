import { emailTokenGenerator } from "../../utils/emailTokenGenerator.utils.js";
import { checkUserResponse, errorResponse } from "../../utils/response.utils.js";

export const checkUserExistByUsernameController = (UserModel) => async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return errorResponse(res, 422, "Please provide username to check whether user exist or not.");
        }
        const isUserExist = await UserModel.findOne({ username: username });
        if (!isUserExist) {
            return checkUserResponse(res, 200, "Username verified successfully. You can continue.");
        }
        return errorResponse(res, 409, "This username already exists. Please use another username.");
    }
    catch (error) {
        return errorResponse(res, 500, "Something went wrong. Please try again later.");
    }
};

export const checkUserExistByEmailController = (UserModel) => async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return errorResponse(res, 422, "Please provide email to check whether user exist or not.");
        }
        if (!emailTokenGenerator.validEmail(email)) {
            return errorResponse(res, 400, "Invalid email format.");
        }
        const isUserExist = await UserModel.findOne({ email: email });
        if (!isUserExist) {
            return checkUserResponse(res, 200, "Email verified successfully. You can continue.");
        }
        return errorResponse(res, 409, "This email already exists. Please use another email.");
    }
    catch (error) {
        return errorResponse(res, 500, "Something went wrong. Please try again later.");
    }
};