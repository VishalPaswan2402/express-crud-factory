import express from "express";
import { connectDatabase, jsonErrorHandler, loginSignupFactory, postArticleFactory } from "../src/index.js";
import UserModel from "./models/user.model.js";
import PostModel from "./models/postArticles.model.js";
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
        secretKey: "your_jwt_secret_key_at_least_256_bits_long",
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
        username: "your_email_username",
        password: "your_email_password"
    },
    verifyMethod: {
        projectName: "Express-Crud-Factory",
        otpLinkExpiryMinutes: 10,
        unverifiedUserExpiryDays: 1,
        usingLink: false, // true -> link and false -> OTP
        frontendBaseUrl: `http://localhost:${port}` // if usinglink = true (use your frontend base url to redirect on verification page)
    }
}

const loginSignupConfig = { secretsConfig, emailConfig };

app.use('/user', loginSignupFactory(UserModel, PostModel, loginSignupConfig));
app.use('/user/post', postArticleFactory(UserModel, PostModel, secretsConfig));

app.listen(port, () => {
    console.log("Server running on port", port);
});
