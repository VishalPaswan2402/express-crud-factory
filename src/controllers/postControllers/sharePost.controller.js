const sharePostController = (PostModel) => async (req, res) => {
    try {
        const { postId } = req.params;
        // finding post.
        const postData = await PostModel.findById(postId);
        if (!postData) {
            return res.status(404).json({
                message: "Posted article not found.",
                success: false
            });
        };
        return res.status(200).json({
            data: postData,
            message: "Post article found successfully.",
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: "Oops! Something went wrong while finding post.",
            success: false
        });
    }
};

export default sharePostController;