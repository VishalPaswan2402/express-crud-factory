import crypto from "crypto";
import bcrypt from 'bcrypt';

export const emailTokenGenerator = {
    emailOtp: async (otp, bcryptSecret) => {
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
    }
}