const loginUserController = (Model) => async (req, res) => {
    console.log("Login user Api is called...");
    try {
        const { username, password } = req.body;
        // validate username and password
        if (!username || !password) {
            return res.status(400).json({
                message: "Both username and password is required.",
                success: false
            });
        }
        // find user by username
        const dataByUsername = await Model.findOne({ username: username });
        if (!dataByUsername) {
            return res.status(404).json({
                message: "Looks like that user doesn't exist in our system.",
                success: false
            });
        }
        // verify password
        if (dataByUsername.password != password) {
            return res.status(401).json({
                message: "Oops! you have entered incorrect password.",
                success: false
            })
        }
        return res.status(200).json({
            data: dataByUsername,
            message: "User logged-in successfully.",
            success: true
        });
    } catch (error) {
        console.log("Login API error...");
        console.log(error);
        return res.status(500).json({
            message: "Oops! Something went wrong on our end.",
            success: false
        });
    }
}

export default loginUserController;