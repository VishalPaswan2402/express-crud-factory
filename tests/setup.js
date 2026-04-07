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
        secretKey: "i3nbhkgw8i3nbhkgw8",
        expireIn: "1d"
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
        frontendBaseUrl: `http://localhost:${port}` // if usinglink = true
    }
}

app.use('/user', loginSignupFactory(DefaultUser, secretsConfig, emailConfig));
app.use('/user/post', postArticleFactory(DefaultUser, DefaultPost, secretsConfig));

app.listen(port, () => {
    console.log("Server running on port", port);
});
