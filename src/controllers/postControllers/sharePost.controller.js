import { errorResponse, successResponse } from "../../utils/response.utils.js";

const sharePostController = (PostModel) => async (req, res) => {
    try {
        const { postId } = req.params;
        const postData = await PostModel.findById(postId);
        if (!postData) {
            return errorResponse(res, 404, "Article not found.");
        };
        return successResponse(res, 200, postData, "Shared article retrieved successfully.");
    }
    catch (error) {
        return errorResponse(res, 500, "Something went wrong. Please try again later.");
    }
};

export default sharePostController;