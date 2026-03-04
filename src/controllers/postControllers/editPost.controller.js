const editPostController = (UserModel, PostModel) => async (req, res) => {
    console.log("Edit post Api is called...");
    try {
        const { userId, postId } = req.params;
        const { title, description } = req.body;
        // verifying req body.
        if (!title || !description) {
            return res.status(400).json({
                message: "Please provide title and description correctly.",
                success: false
            });
        }
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
        // updating value
        postData.title = title;
        postData.description = description;
        await postData.save();
        return res.status(200).json({
            data: postData,
            message: "Post article edited successfully.",
            success: true
        });
    } catch (error) {
        console.log("Edit post API error...");
        console.log(error);
        return res.status(500).json({
            message: "Oops! Something went wrong on our end.",
            success: false
        });
    }
}

export default editPostController;