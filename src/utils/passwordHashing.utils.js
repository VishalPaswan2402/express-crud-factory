import bcrypt from 'bcrypt';

export const passwordHashing = {
    securePassword: (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
        return regex.test(password);
    },
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