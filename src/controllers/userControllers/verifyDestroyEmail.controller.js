import { emailTokenGenerator } from "../../utils/emailTokenGenerator.utils.js";

const verifyDestroyEmailController = (UserModel, isLink) => async (req, res) => {
    try {
        const { userId } = req.params;
        let myToken = null;
        if (isLink) {
            const { token } = req.query;
            if (!token) {
                return res.status(400).json({
                    message: "Token is missing",
                    success: false
                });
            }
            myToken = token;
        }
        else {
            const { otp } = req.body;
            if (!otp || otp == "") {
                return res.status(400).json({
                    message: "Please fill OTP correctly.",
                    success: false
                });
            }
            myToken = otp;
        }
        // find user
        const user = await UserModel.findById(userId).select("+verifyToken +verifyTokenExpires");
        if (!user) {
            return res.status(404).json({
                message: "Invalid request, account not found.",
                success: false
            });
        }
        if (!user.isActive) {
            return res.status(400).json({
                message: "Your account is blocked, you can't delete it.",
                success: false
            });
        }
        // check token validity
        if (!user.verifyToken || !user.verifyTokenExpires || user.verifyTokenExpires < Date.now()) {
            return res.status(400).json({
                message: "OTP expired, generate new OTP.",
                success: false
            });
        }
        if (isLink) {
            if (user.verifyToken !== myToken) {
                return res.status(400).json({
                    message: "Invalid token, generate new token.",
                    success: false
                });
            }
        }
        else {
            const isValidOtp = await emailTokenGenerator.compareOtp(myToken, user.verifyToken);
            if (!isValidOtp) {
                return res.status(400).json({
                    message: "Invalid, please enter correct OTP.",
                    success: false
                });
            }
        }
        // finding user from userID and deleting.
        const deleteData = await UserModel.findByIdAndDelete(userId);
        const deletedData = {
            userId: userId,
            username: deleteData.username,
            fullname: deleteData.fullname,
            email: deleteData.email
        }
        return res.status(200).json({
            data: deletedData,
            message: "User data deleted successfully.",
            success: true
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Oops! Something went wrong while deleting user data.",
            success: false
        });
    }
}

export default verifyDestroyEmailController;