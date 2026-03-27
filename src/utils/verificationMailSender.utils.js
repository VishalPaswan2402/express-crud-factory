import { getVerificationEmailTemplate } from "./verifyEmailBodyTemplate.utils.js";
import { getOtpVerificationEmailTemplate } from "./verifyOtpBodyTemplate.utils.js";

export const verificationMailSender = {
    sendEmail: async (emailSender, verifyMethod, email, create, fullname, verificationSend) => {
        await emailSender.sendMail({
            from: `${verifyMethod.projectName} <${emailSender.options.auth.user}>`,
            to: email,
            subject: `Account ${create ? "activation" : "deactivation"} mail.`,
            text: `${verifyMethod.usingLink ? "Link" : "OTP"} to ${create ? 'activate' : 'deactivate'} your account : ${verificationSend}`,
            html: verifyMethod.usingLink ?
                getVerificationEmailTemplate(verificationSend, verifyMethod.otpLinkExpiryMinutes, create, fullname, verifyMethod.projectName)
                :
                getOtpVerificationEmailTemplate(verificationSend, verifyMethod.otpLinkExpiryMinutes, create, fullname, verifyMethod.projectName)
        });
    }
}