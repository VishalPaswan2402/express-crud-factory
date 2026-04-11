import crypto from "crypto";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken"

export const emailTokenGenerator = {
    validEmail: (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },
    generateOtp: () => {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        return otp;
    },
    hashOtp: async (otp, bcryptSecret) => {
        const saltRounds = bcryptSecret.salts;
        const hashedOtp = await bcrypt.hash(otp, saltRounds);
        return hashedOtp;
    },
    compareOtp: async (otp, hashedOtp) => {
        const isValid = await bcrypt.compare(otp, hashedOtp);
        return isValid;
    },
    emailToken: () => {
        const emailToken = crypto.randomBytes(32).toString("hex");
        return emailToken;
    },
    emailEncryptToken: (email, verifyType, emailTokenSecret) => {
        const token = jwt.sign(
            {
                email: email,
                verifyType: verifyType
            },
            emailTokenSecret.secret,
            {
                expiresIn: emailTokenSecret.expireIn
            }
        );
        return token;
    },
    emailDecryptToken: (token, emailTokenConfig) => {
        try {
            const emailTokenData = jwt.verify(token, emailTokenConfig?.emailTokenSecret?.secret);
            return emailTokenData;
        } catch (error) {
            return null;
        }
    }
}