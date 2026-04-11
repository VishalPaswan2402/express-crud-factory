import { emailTokenGenerator } from "./emailTokenGenerator.utils.js"

export const verificationToken = {
    saveSendToken: async (verifyMethod, userSecretConfig, emailTokenConfig, create, email) => {
        if (verifyMethod.usingLink) {
            const saveToken = emailTokenGenerator.emailEncryptToken(email, create, emailTokenConfig?.emailTokenSecret);
            const sendToken = `${verifyMethod.frontendBaseUrl}/user/${create === 1 ? 'signup' : create === 2 ? 'reset-password' : 'delete-account'}/link/verify-email?token=${saveToken}`;
            return { saveToken, sendToken };
        }
        else {
            const sendToken = emailTokenGenerator.generateOtp();
            const saveToken = await emailTokenGenerator.hashOtp(sendToken, userSecretConfig.bcryptSecret);
            return { saveToken, sendToken };
        }
    }
}