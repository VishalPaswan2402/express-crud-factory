import { dataExpiryTime } from "../../utils/dataExpiryTime.utils.js";
import { passwordHashing } from "../../utils/passwordHashing.utils.js";
import { verificationMailSender } from "../../utils/verificationMailSender.utils.js";
import { verificationToken } from "../../utils/verificationToken.utils.js";

const createUserController = (UserModel, userSecretConfig, emailSender, verifyMethod) => async (req, res) => {
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
        const userExist = await UserModel.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        }).select("+destroyDataAfter");
        if (userExist) {
            if (userExist.emailVerified || userExist.destroyDataAfter > Date.now()) {
                return res.status(400).json({
                    message: "Looks like someone already registered with that username or email.",
                    success: false
                });
            }
            else {
                await UserModel.findByIdAndDelete(userExist._id);
            }
        }
        // hash plain password.
        const hashedPassword = await passwordHashing.hashPassword(password, userSecretConfig.bcryptSecret);
        // saving data.
        const modelData = new UserModel({
            ...req.body,
            password: hashedPassword,
            destroyDataAfter: dataExpiryTime.userDataExpire(verifyMethod.unverifiedUserExpiryDays)
        });
        const data = await modelData.save();
        // generate link or otp
        const generatedToken = await verificationToken.saveSendToken(verifyMethod, userSecretConfig, 1, data._id);
        let verificationSave = generatedToken.saveToken;
        let verificationSend = generatedToken.sendToken;
        // save token
        data.verifyToken = verificationSave;
        data.otpRequestCount = 1;
        data.verifyTokenExpires = dataExpiryTime.otpLinkExpire(verifyMethod.otpLinkExpiryMinutes);
        await data.save();
        // send mail
        await verificationMailSender.sendEmail(emailSender, verifyMethod, data.email, 1, data.fullname, verificationSend);
        // send userId for otp verify
        const userData = {
            userId: data._id,
            fullName: fullname,
            email: email
        };
        return res.status(200).json({
            data: userData,
            message: `Verification ${verifyMethod.usingLink ? "link" : "OTP"} sended to your email successfully.`,
            success: true
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Oops! Something went wrong while saving new user.Try again later.",
            success: false
        });
    }
}

export default createUserController;