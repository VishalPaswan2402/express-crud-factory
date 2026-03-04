const getPostController = (UserModel, PostModel) => async (req, res) => {
    console.log("Get post Api called...");
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
        return res.status(200).json({
            data: postData,
            message: "Post article found successfully.",
            success: true
        });
    } catch (error) {
        console.log("Create post API error...");
        console.log(error);
        return res.status(500).json({
            message: "Oops! Something went wrong on our end.",
            success: false
        });
    }
}
export default getPostController;