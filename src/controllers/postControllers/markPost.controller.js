import { errorResponse, successResponse } from "../../utils/response.utils.js";

const markPostController = (UserModel, PostModel, isTrash) => async (req, res) => {
    try {
        const { userId, postId } = req.params;
        const userData = await UserModel.findById(userId);
        if (!userData) {
            return errorResponse(res, 404, "User not found.");
        };
        const postData = await PostModel.findById(postId);
        if (!postData) {
            return errorResponse(res, 404, "Article not found.");
        };
        if (postData.author != userId) {
            return errorResponse(res, 403, "You do not have permission to mark this article.");
        };
        let msg = "Article moved to trash.";
        if (isTrash) {
            postData.isTrashed ? postData.deleteAt = null : postData.deleteAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            postData.isTrashed = !postData.isTrashed;
            msg = postData.isTrashed ? "Article moved to trash." : "Article restored from trash.";
        }
        else {
            if (postData.isTrashed) {
                return errorResponse(res, 410, "You cannot pin a trashed article.");
            }
            postData.isPinned = !postData.isPinned;
            msg = postData.isPinned ? "Article pinned successfully." : "Article unpinned successfully.";
        }
        await postData.save();
        const pinnedPost = await PostModel.findById(postId).lean();
        return successResponse(res, 200, pinnedPost, msg);
    }
    catch (error) {
        return errorResponse(res, 500, "Something went wrong. Please try again later.");
    }
};

export default markPostController;