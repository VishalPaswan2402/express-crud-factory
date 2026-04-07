import { errorResponse, successResponse } from "../../utils/response.utils.js";

const deletePostController = (UserModel, PostModel) => async (req, res) => {
    try {
        const { userId, postId } = req.params;
        const userData = await UserModel.findById(userId);
        if (!userData) {
            return errorResponse(res, 404, "User not found.");
        }
        const postData = await PostModel.findById(postId);
        if (!postData) {
            return errorResponse(res, 404, "Article not found.");
        }
        if (postData.author != userId) {
            return errorResponse(res, 403, "You do not have permission to delete this article.");
        }
        const deletedPost = await PostModel.findByIdAndDelete(postId);
        const removeReference = await UserModel.findByIdAndUpdate(userId, {
            $pull: { articles: postId }
        });
        return successResponse(res, 200, null, "Article deleted successfully.");
    }
    catch (error) {
        return errorResponse(res, 500, "Something went wrong. Please try again later.");
    }
}

export default deletePostController;