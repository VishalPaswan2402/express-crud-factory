import { querySearch } from "../../utils/querySearch.utils.js";
import { errorResponse, successResponse } from "../../utils/response.utils.js";

const searchByTitleController = (PostModel) => async (req, res) => {
    try {
        const { text } = req.query;
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        if (!text) {
            return errorResponse(res, 400, "Text query is required.");
        }
        if (!userId) {
            return errorResponse(res, 400, "User ID is required.");
        }
        const query = {
            author: userId,
            title: { $regex: text, $options: "i" }
        };
        const pageData = await querySearch.pageRange(PostModel, query, page, limit);
        if (!pageData.value) {
            return errorResponse(res, 404, "Requested page not found. Page number exceeds total pages.");
        };
        const responseData = await querySearch.queryData(PostModel, query, skip, limit, pageData.totalDocument, pageData.totalPages, pageData.currentPage);
        return successResponse(res, 200, responseData, "Data retrieved successfully.");
    }
    catch (error) {
        return errorResponse(res, 500, "Something went wrong. Please try again later.");
    }
}

export default searchByTitleController;