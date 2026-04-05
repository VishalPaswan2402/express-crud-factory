const getUserByIdController = (UserModel) => async (req, res) => {
    try {
        const { userId } = req.params;
        const data = await UserModel.findById(userId);
        if (!data) {
            return res.status(404).json({
                message: "Looks like that user doesn't exist in our system.",
                success: false
            });
        }
        if (!data.isActive) {
            return res.status(400).json({
                message: "Your account is blocked, you can't access it.",
                success: false
            });
        }
        const responseData = {
            _id: data._id,
            username: data.username,
            fullname: data.fullname,
            email: data.email,
            active: data.isActive,
            emailVerified: data.emailVerified,
            totalArticles: data.articles.length
        }
        return res.status(200).json({
            data: responseData,
            message: "User found successfully.",
            success: true
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Oops! Something went wrong while finding user.",
            success: false
        });
    }
}

export default getUserByIdController;