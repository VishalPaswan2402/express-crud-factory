const markPostController = (UserModel, PostModel, isTrash) => async (req, res) => {
    try {
        const { userId, postId } = req.params;
        // finding user.
        const userData = await UserModel.findById(userId);
        if (!userData) {
            return res.status(404).json({
                message: "User doesn't exist. Please create your account.",
                success: false
            });
        };
        // finding post.
        const postData = await PostModel.findById(postId);
        if (!postData) {
            return res.status(404).json({
                message: "Posted article not found.",
                success: false
            });
        };
        // check author
        if (postData.author != userId) {
            return res.status(403).json({
                message: "You do not have permission to mark this post.",
                success: false
            });
        };
        let msg = "move to trash file";
        if (isTrash) {
            postData.isTrashed ? postData.deletedAt = null : postData.deletedAt = new Date();
            postData.isTrashed = !postData.isTrashed;
            msg = postData.isTrashed ? "moved to trash file" : "recovered from trash file";
        }
        else {
            postData.isPinned = !postData.isPinned;
            msg = postData.isPinned ? "marked as important" : "marked as default";
        }
        await postData.save();
        const pinnedPost = await PostModel.findById(postId).lean();
        return res.status(200).json({
            data: pinnedPost,
            message: `Post article ${msg}.`,
            success: true
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Oops! Something went wrong while marking post.",
            success: false
        });
    }
};

export default markPostController;