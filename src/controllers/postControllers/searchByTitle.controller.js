const searchByTitle = (PostModel) => async (req, res) => {
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
        const total = await PostModel.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        if (page > totalPages && totalPages > 0) {
            return res.status(400).json({
                success: false,
                message: "Page exceeds total pages",
                totalPages
            });
        };
        const posts = await PostModel.find(query)
            .skip(skip)
            .limit(limit);

        const responseData = {
            totalDocument: total,
            totalPages: totalPages,
            currentPage: page,
            searchText: search,
            data: posts
        };
        return res.status(200).json({
            data: responseData,
            message: posts.length < 1 ? "No matching data found." : "Find matching data.",
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

export default searchByTitle;