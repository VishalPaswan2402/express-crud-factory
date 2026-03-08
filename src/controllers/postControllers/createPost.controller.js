const createPostController = (UserModel, PostModel) => async (req, res) => {
    try {
        const { userId } = req.params;
        const { title, description } = req.body;
        // verifying req body.
        if (!title || !description) {
            return res.status(400).json({
                message: "Please provide title and description correctly.",
                success: false
            });
        }
        // finding user.
        const author = await UserModel.findById(userId);
        if (!author) {
            return res.status(404).json({
                message: "User doesn't exist. Please create your account.",
                success: false
            });
        }
        // creating object and saving it.
        const newArticle = new PostModel({
            title: title,
            description: description,
            author: userId
        });
        const savedArticle = await newArticle.save();
        // saving post ID in user schema.
        author.articles.push(savedArticle._id);
        await author.save();
        return res.status(200).json({
            data: savedArticle,
            message: "New article created successfully.",
            success: true
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Oops! Something went wrong while saving post.",
            success: false
        });
    }
}

export default createPostController;