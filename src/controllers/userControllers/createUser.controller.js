import { dataExpiryTime } from "../../utils/dataExpiryTime.utils.js";
import { emailTokenGenerator } from "../../utils/emailTokenGenerator.utils.js";
import { passwordHashing } from "../../utils/passwordHashing.utils.js";
import { errorResponse, successResponse } from "../../utils/response.utils.js";
import { verificationMailSender } from "../../utils/verificationMailSender.utils.js";
import { verificationToken } from "../../utils/verificationToken.utils.js";

const createUserController = (UserModel, userSecretConfig, emailSender, verifyMethod) => async (req, res) => {
    try {
        const { email, username, fullname, password, confirmPassword } = req.body;
        if (!email || !username || !fullname || !password || !confirmPassword) {
            return errorResponse(res, 422, "Please provide email, username, fullname, password, and confirm password.");
        }
        if (!emailTokenGenerator.validEmail(email)) {
            return errorResponse(res, 400, "Invalid email format.");
        }
        if (!passwordHashing.securePassword(password)) {
            return errorResponse(res, 400, "Password must be at least 8 characters long and include uppercase, lowercase, a digit, and a special character.");
        }
        if (password != confirmPassword) {
            return errorResponse(res, 422, "Password and confirm password must match.");
        }
        const userExist = await UserModel.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        }).select("+destroyDataAfter");
        if (userExist) {
            if (userExist.emailVerified || userExist.destroyDataAfter > Date.now()) {
                return errorResponse(res, 409, "This email or username is already taken. Please try another one.");
            }
            else {
                await UserModel.findByIdAndDelete(userExist._id);
            }
        }
        const hashedPassword = await passwordHashing.hashPassword(password, userSecretConfig.bcryptSecret);
        const modelData = new UserModel({
            ...req.body,
            password: hashedPassword,
            destroyDataAfter: dataExpiryTime.userDataExpire(verifyMethod.unverifiedUserExpiryDays)
        });
        const data = await modelData.save();
        const generatedToken = await verificationToken.saveSendToken(verifyMethod, userSecretConfig, 1, data._id);
        let verificationSave = generatedToken.saveToken;
        let verificationSend = generatedToken.sendToken;
        data.verifyToken = verificationSave;
        data.otpRequestCount = 1;
        data.verifyTokenExpires = dataExpiryTime.otpLinkExpire(verifyMethod.otpLinkExpiryMinutes);
        await data.save();
        await verificationMailSender.sendEmail(emailSender, verifyMethod, data.email, 1, data.fullname, verificationSend);
        const userData = {
            userId: data._id,
            fullName: fullname,
            email: email
        };
        return successResponse(res, 200, userData, `Verification ${verifyMethod.usingLink ? "link" : "OTP"} sent to your email successfully.`);
    }
    catch (error) {
        return errorResponse(res, 500, "Something went wrong. Please try again later.");
    }
}

export default createUserController;