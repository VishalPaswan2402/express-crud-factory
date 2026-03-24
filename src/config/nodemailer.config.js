import nodemailer from 'nodemailer';

export const nodemailerConfig = (configValue) => {
    const emailSenderConfig = nodemailer.createTransport({
        host: configValue.host,
        secure: configValue.secure,
        auth: {
            user: configValue.username,
            pass: configValue.password
        },
    });
    return emailSenderConfig;
}