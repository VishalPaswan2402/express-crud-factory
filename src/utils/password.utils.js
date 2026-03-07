import bcrypt from 'bcrypt';

export const passwordHashing = {
    hashPassword: async (password) => {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    },
    comparePassword: async (password, hashedPassword) => {
        const isValid = await bcrypt.compare(password, hashedPassword);
        return isValid;
    }
}