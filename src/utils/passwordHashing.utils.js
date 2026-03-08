import bcrypt from 'bcrypt';

export const passwordHashing = {
    hashPassword: async (password, bcryptSecret) => {
        const saltRounds = bcryptSecret.salts;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    },
    comparePassword: async (password, hashedPassword) => {
        const isValid = await bcrypt.compare(password, hashedPassword);
        return isValid;
    }
}