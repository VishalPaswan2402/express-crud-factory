import { dataExpiryTime } from "../../utils/dataExpiryTime.utils.js";
import { emailTokenGenerator } from "../../utils/emailTokenGenerator.utils.js";
import { passwordHashing } from "../../utils/passwordHashing.utils.js";
import { getVerificationEmailTemplate } from "../../utils/verifyEmailBodyTemplate.utils.js";
import { getOtpVerificationEmailTemplate } from "../../utils/verifyOtpBodyTemplate.utils.js";

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
        let verificationSave = null;
        let verificationSend = null;
        // generate link or otp
        if (verifyMethod.usingLink) {
            verificationSave = emailTokenGenerator.emailToken();
            verificationSend = `${verifyMethod.frontendBaseUrl}/user/signup/verify-email?token=${verificationSave}`;
        }
        else {
            verificationSend = emailTokenGenerator.generateOtp();
            verificationSave = await emailTokenGenerator.hashOtp(verificationSend, userSecretConfig.bcryptSecret);
        }
        // saving data.
        const modelData = new UserModel({
            ...req.body,
            password: hashedPassword,
            verifyToken: verificationSave,
            verifyTokenExpires: dataExpiryTime.otpLinkExpire(verifyMethod.otpLinkExpiryMinutes),
            destroyDataAfter: dataExpiryTime.userDataExpire(verifyMethod.unverifiedUserExpiryDays)
        });
        const data = await modelData.save();
        // send mail
        await emailSender.sendMail({
            from: `${verifyMethod.projectName} <${emailSender.options.auth.user}>`,
            to: email,
            subject: "Verify your Email",
            text: `${verifyMethod.usingLink ? "Link" : "OTP"} to verify email : ${verificationSend}`,
            html: verifyMethod.usingLink ? getVerificationEmailTemplate(verificationSend, fullname, verifyMethod.projectName) : getOtpVerificationEmailTemplate(verificationSend, fullname, verifyMethod.projectName)
        });
        // send userId for otp verify
        const userData = { userId: data._id };
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