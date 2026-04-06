import { emailTokenGenerator } from "./emailTokenGenerator.utils.js"

export const verificationToken = {
    saveSendToken: async (verifyMethod, userSecretConfig, create, userId) => {
        if (verifyMethod.usingLink) {
            const saveToken = emailTokenGenerator.emailToken();
            const sendToken = `${verifyMethod.frontendBaseUrl}/user/${create === 1 ? 'signup' : create === 2 ? 'recover' : 'destroy'}/${userId}/verify-email?token=${saveToken}`;
            return { saveToken, sendToken };
        }
        else {
            const sendToken = emailTokenGenerator.generateOtp();
            const saveToken = await emailTokenGenerator.hashOtp(sendToken, userSecretConfig.bcryptSecret);
            return { saveToken, sendToken };
        }
    }
}