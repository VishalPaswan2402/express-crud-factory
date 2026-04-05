import { querySearch } from "../../utils/querySearch.utils.js";

const allPostController = (UserModel, PostModel) => async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // finding user.
        const userData = await UserModel.findById(userId);
        if (!userData) {
            return res.status(404).json({
                message: "User doesn't exist. Please create your account.",
                success: false
            });
        }
        // finding post.
        const query = {
            author: userId,
        };
        // page range
        const pageData = await querySearch.pageRange(PostModel, query, page, limit);
        if (!pageData.value) {
            return res.status(400).json({
                success: false,
                message: "Page exceeds total pages",
                totalPages: pageData.totalPages
            });
        }
        // find document
        const responseData = await querySearch.queryData(PostModel, query, skip, limit, pageData.totalDocument, pageData.totalPages, pageData.currentPage);
        return res.status(200).json({
            data: responseData,
            message: responseData.data.length < 1 ? "No post article added yet." : "All post article found successfully.",
            success: true
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Oops! Something went wrong while finding all post.",
            success: false
        });
    }
};

export default allPostController;