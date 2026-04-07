import { querySearch } from "../../utils/querySearch.utils.js";
import { errorResponse, successResponse } from "../../utils/response.utils.js";

const allPostController = (UserModel, PostModel) => async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const userData = await UserModel.findById(userId);
        if (!userData) {
            return errorResponse(res, 404, "User not found.");
        }
        const query = {
            author: userId,
        };
        const pageData = await querySearch.pageRange(PostModel, query, page, limit);
        if (!pageData.value) {
            return errorResponse(res, 404, "Requested page not found. Page number exceeds total pages.");
        }
        const responseData = await querySearch.queryData(PostModel, query, skip, limit, pageData.totalDocument, pageData.totalPages, pageData.currentPage);
        return successResponse(res, 200, responseData, "Articles fetched successfully.");
    }
    catch (error) {
        return errorResponse(res, 500, "Something went wrong. Please try again later.");
    }
};

export default allPostController;