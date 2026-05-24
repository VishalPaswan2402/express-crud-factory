const logoutUserController = (UserModel, ExpiredTokensModel) => async (req, res) => {
    try {
        const { userId } = req.params;
        const userData = await UserModel.findById(userId).select("+jwtRefreshToken");
        if (!userData) {
            return errorResponse(res, 404, "User not found.");
        }
        userData.jwtRefreshToken = null;
        await userData.save();
        const newExpiredToken = new ExpiredTokensModel({
            accessToken: req.incomingAccessToken.token,
            expireTime: req.incomingAccessToken.expiryTime
        });
        await newExpiredToken.save();
        const options = {
            httpOnly: true,
            secure: true
        };
        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({
                message: "User logged out successfully.",
                success: true
            });
    }
    catch (error) {
        return errorResponse(res, 500, "Something went wrong. Please try again later.");
    }
}

export default logoutUserController;