const deletePostController = (UserModel, PostModel) => async (req, res) => {
    console.log("Delete post api is called...");
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
        // finding post to delete.
        const postData = await PostModel.findById(postId);
        if (!postData) {
            return res.status(404).json({
                message: "Posted article not found.",
                success: false
            });
        }
        // delete post.
        const deletedPost = await PostModel.findByIdAndDelete(postId);
        // removing reference from user.
        const removeReference = await UserModel.findByIdAndUpdate(userId, {
            $pull: { articles: postId }
        });
        return res.status(200).json({
            data: deletedPost,
            message: "Article deleted successfully.",
            success: true
        });
    } catch (error) {
        console.log("Delete post API error...");
        console.log(error);
        return res.status(500).json({
            message: "Oops! Something went wrong on our end.",
            success: false
        });
    }
}

export default deletePostController;