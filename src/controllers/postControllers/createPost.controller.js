import { errorResponse, successResponse } from "../../utils/response.utils.js";

const createPostController = (UserModel, PostModel) => async (req, res) => {
    try {
        const { userId } = req.params;
        const { title, description } = req.body;
        if (!title || !description) {
            return errorResponse(res, 400, "Title and description are required.");
        }
        const author = await UserModel.findById(userId);
        if (!author) {
            return errorResponse(res, 404, "User not found.");
        }
        const newArticle = new PostModel({
            title: title,
            description: description,
            author: userId
        });
        const savedArticle = await newArticle.save();
        author.articles.push(savedArticle._id);
        await author.save();
        return successResponse(res, 201, savedArticle, "Article created successfully.");
    }
    catch (error) {
        return errorResponse(res, 500, "Something went wrong. Please try again later.");
    }
}

export default createPostController;