const createUserController = (Model) => async (req, res) => {
    console.log("Create user Api called...");
    try {
        // validating input data.
        const { email, username, fullname, password, confirmPassword } = req.body;
        if (!email || !username || !fullname || !password || !confirmPassword) {
            return res.status(400).json({
                message: "Please fill all data correctly.",
                success: false
            });
        }
        // comparing password.
        if (password != confirmPassword) {
            return res.status(400).json({
                message: "Oops! Your passwords don't match.",
                success: false
            });
        }
        // finding if username or email already exist.
        const userExist = await Model.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        });
        if (userExist) {
            return res.status(400).json({
                message: "Looks like someone already registered with that username or email.",
                success: false
            });
        }
        // saving data.
        const modelData = new Model(req.body);
        const data = await modelData.save();
        return res.status(200).json({
            data: data,
            message: "New user created successfully.",
            success: true
        });
    } catch (error) {
        console.log("Create API error...");
        console.log(error);
        return res.status(500).json({
            message: "Oops! Something went wrong on our end.",
            success: false
        });
    }
}

export default createUserController;