const getPostController = (UserModel, PostModel) => async (req, res) => {
    try {
        const { postId, userId } = req.params;
        // finding user.
        const userData = await UserModel.findById(userId);
        if (!userData) {
            return res.status(404).json({
                message: "User doesn't exist. Please create your account.",
                success: false
            });
        }
        // finding post.
        const postData = await PostModel.findById(postId);
        if (!postData) {
            return res.status(404).json({
                message: "Posted article not found.",
                success: false
            });
        }
        // check author
        if (postData.author != userId) {
            return res.status(403).json({
                message: "No permission to view this post article.",
                success: false
            });
        }
        return res.status(200).json({
            data: postData,
            message: "Post article found successfully.",
            success: true
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Oops! Something went wrong while finding post.",
            success: false
        });
    }
}
export default getPostController;