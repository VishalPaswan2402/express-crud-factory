const deletePostController = (UserModel, PostModel) => async (req, res) => {
    try {
        const { userId, postId } = req.params;
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
                message: "No permission to delete this post article.",
                success: false
            });
        }
        // delete post.
        const deletedPost = await PostModel.findByIdAndDelete(postId);
        // remove reference from user.
        const removeReference = await UserModel.findByIdAndUpdate(userId, {
            $pull: { articles: postId }
        });
        return res.status(200).json({
            data: deletedPost,
            message: "Article deleted successfully.",
            success: true
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Oops! Something went wrong while deleting post.",
            success: false
        });
    }
}

export default deletePostController;