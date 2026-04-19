import express from "express";
import { connectDatabase, jsonErrorHandler, loginSignupFactory, postArticleFactory } from "../src/index.js";
import DefaultUser from "./models/user.model.js";
import DefaultPost from "./models/postArticles.model.js";
const app = express();
app.use(express.json());
app.use(jsonErrorHandler);
const port = 3000;

// database setup
const db_url = 'mongodb://127.0.0.1:27017/packageTest';
await connectDatabase(db_url);

// secret configuration
const secretsConfig = {
    jwtSecret: {
        secretKey: "093hfor02yc7hdh46a9c0b2d5e093rbchw322je4v62c5d7e8f184hdyqb3kf6i2z",
        expireInDays: 1
    },
    bcryptSecret: {
        saltRounds: 10
    }
};

// email configuration
const emailConfig = {
    mailProvider: {
        host: "smtp.ethereal.email",
        secure: false,
        username: "herta.muller@ethereal.email",
        password: "khFdgXewnAKvYSzSma"
    },
    verifyMethod: {
        projectName: "Express-Crud-Factory",
        otpLinkExpiryMinutes: 2,
        unverifiedUserExpiryDays: 1,
        usingLink: true, // true -> link and false -> OTP
        verifySecretKey: "093hfjsbc451e4f6a9c0b2d5e7f8a1ckr912je4v62c5d7e8f1a3c6lelq0f6i2z", // if link = true
        frontendBaseUrl: `http://localhost:${port}` // if usinglink = true (use your frontend base url)
    }
}

app.use('/user', loginSignupFactory(DefaultUser, DefaultPost, secretsConfig, emailConfig));
app.use('/user/post', postArticleFactory(DefaultUser, DefaultPost, secretsConfig));

app.listen(port, () => {
    console.log("Server running on port", port);
});
