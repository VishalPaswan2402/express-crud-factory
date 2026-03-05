const getUserByIdController = (Model) => async (req, res) => {
    try {
        const { userId } = req.params;
        // finding user from userID.
        const data = await Model.findById(userId);
        if (!data) {
            return res.status(404).json({
                message: "Looks like that user doesn't exist in our system.",
                success: false
            });
        }
        return res.status(200).json({
            data: data,
            message: "User found successfully.",
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: "Oops! Something went wrong while finding user.",
            success: false
        });
    }
}

export default getUserByIdController;