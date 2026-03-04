const destroyUserController = (Model) => async (req, res) => {
    console.log("Delete user Api called...");
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
        const deleteData = await Model.findByIdAndDelete(userId);
        console.log(deleteData);
        return res.status(200).json({
            data: data,
            message: "User data deleted successfully.",
            success: true
        });
    } catch (error) {
        console.log("Delete API error...");
        console.log(error);
        return res.status(500).json({
            message: "Oops! Something went wrong on our end.",
            success: false
        });
    }
}

export default destroyUserController;