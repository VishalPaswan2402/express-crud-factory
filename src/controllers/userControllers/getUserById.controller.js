import { errorResponse, successResponse } from "../../utils/response.utils.js";

const getUserByIdController = (UserModel) => async (req, res) => {
    try {
        const { userId } = req.params;
        const data = await UserModel.findById(userId);
        if (!data) {
            return errorResponse(res, 404, "User not found.");
        }
        if (!data.emailVerified) {
            return errorResponse(res, 403, `Email not verified.`);
        }
        if (!data.isActive) {
            return errorResponse(res, 403, "Your account is blocked. Please contact support.");
        }
        const responseData = {
            _id: data._id,
            username: data.username,
            fullname: data.fullname,
            email: data.email,
            active: data.isActive,
            emailVerified: data.emailVerified,
            totalArticles: data.articles.length
        }
        return successResponse(res, 200, responseData, "User retrieved successfully.");
    }
    catch (error) {
        return errorResponse(res, 500, "Something went wrong. Please try again later.");
    }
}

export default getUserByIdController;