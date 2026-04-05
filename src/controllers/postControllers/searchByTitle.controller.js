import { querySearch } from "../../utils/querySearch.utils.js";

const searchByTitleController = (PostModel) => async (req, res) => {
    try {
        const { search } = req.query;
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        if (!search) {
            return res.status(400).json({
                success: false,
                message: "Search text is required."
            });
        }
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "UserId is required."
            });
        }
        const query = {
            author: userId,
            title: { $regex: search, $options: "i" }
        };
        // find range
        const pageData = await querySearch.pageRange(PostModel, query, page, limit);
        if (!pageData.value) {
            return res.status(400).json({
                success: false,
                message: "Page exceeds total pages",
                totalPages: pageData.totalPages
            });
        };
        // find document
        const responseData = await querySearch.queryData(PostModel, query, skip, limit, pageData.totalDocument, pageData.totalPages, pageData.currentPage);
        return res.status(200).json({
            data: responseData,
            message: responseData.data.length < 1 ? "No matching data found." : "Find matching data.",
            success: true
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Oops! Something went wrong while searching post.",
            success: false
        });
    }
}

export default searchByTitleController;