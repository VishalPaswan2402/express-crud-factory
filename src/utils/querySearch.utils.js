export const querySearch = {
    pageRange: async (PostModel, query, page, limit) => {
        const total = await PostModel.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        if (page > totalPages && totalPages > 0) {
            return { value: false, totalPages: totalPages };
        };
        const pageData = {
            value: true,
            totalDocument: total,
            totalPages: totalPages,
            currentPage: page,
        }
        return pageData;
    },
    queryData: async (PostModel, query, skip, limit, total, totalPages, page) => {
        const allPost = await PostModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const responseData = {
            totalDocument: total,
            totalPages: totalPages,
            currentPage: page,
            data: allPost
        };
        return responseData;
    }
}