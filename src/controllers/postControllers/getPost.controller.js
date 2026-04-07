import { errorResponse, successResponse } from "../../utils/response.utils.js";

const getPostController = (UserModel, PostModel) => async (req, res) => {
    try {
        const { postId, userId } = req.params;
        const userData = await UserModel.findById(userId);
        if (!userData) {
            return errorResponse(res, 404, "User not found.");
        }
        const postData = await PostModel.findById(postId);
        if (!postData) {
            return errorResponse(res, 404, "Article not found.");
        }
        if (postData.author != userId) {
            return errorResponse(res, 403, "You do not have permission to view this article.");
        }
        return successResponse(res, 200, postData, "Article retrieved successfully.");
    }
    catch (error) {
        return errorResponse(res, 500, "Something went wrong. Please try again later.");
    }
}
export default getPostController;