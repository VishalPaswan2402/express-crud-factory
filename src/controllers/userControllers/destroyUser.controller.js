const destroyUserController = (Model) => async (req, res) => {
    try {
        const { userId } = req.params;
        // finding user from userID and deleting.
        const deleteData = await Model.findByIdAndDelete(userId);
        if (!deleteData) {
            return res.status(404).json({
                message: "Looks like that user doesn't exist in our system.",
                success: false
            });
        };
        return res.status(200).json({
            data: deleteData,
            message: "User data deleted successfully.",
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: "Oops! Something went wrong while deleting user data.",
            success: false
        });
    }
}

export default destroyUserController;