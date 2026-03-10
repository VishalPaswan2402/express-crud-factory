const allPostController = (UserModel, PostModel) => async (req, res) => {
    try {
        const { userId } = req.params;
        // finding user.
        const userData = await UserModel.findById(userId);
        if (!userData) {
            return res.status(404).json({
                message: "User doesn't exist. Please create your account.",
                success: false
            });
        }
        // finding post.
        const allPost = await PostModel.find({ author: userId }).sort({ createdAt: -1 });
        if (!allPost || allPost.length === 0) {
            return res.status(200).json({
                data: [],
                message: "No post article added yet.",
                success: true
            });
        }
        return res.status(200).json({
            data: allPost,
            message: "All post article found successfully.",
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