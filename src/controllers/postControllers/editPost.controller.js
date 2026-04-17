import { errorResponse, successResponse } from "../../utils/response.utils.js";

const editPostController = (UserModel, PostModel) => async (req, res) => {
    try {
        const { userId, postId } = req.params;
        const { title, description } = req.body;
        if (!title || !description) {
            return errorResponse(res, 400, "Title and description are required.");
        }
        const userData = await UserModel.findById(userId);
        if (!userData) {
            return errorResponse(res, 404, "User not found.");
        }
        const postData = await PostModel.findById(postId);
        if (!postData) {
            return errorResponse(res, 404, "Article not found.");
        }
        if (postData.author != userId) {
            return errorResponse(res, 403, "You do not have permission to edit this article.");
        }
        if (postData.isTrashed) {
            return errorResponse(res, 410, "You cannot edit a trashed article.");
        }
        postData.title = title;
        postData.description = description;
        await postData.save();
        const updatedData = await PostModel.findById(postId).lean();
        return successResponse(res, 200, updatedData, "Article updated successfully.");
    }
    catch (error) {
        return errorResponse(res, 500, "Something went wrong. Please try again later.");
    }
}

export default editPostController;