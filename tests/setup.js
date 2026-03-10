import express from "express";
import { connectDatabase, jsonErrorHandler, loginSignupFactory, postArticleFactory } from "../src/index.js";
import DefaultUser from "./models/user.model.js";
import DefaultPost from "./models/postArticles.model.js";
const app = express();
app.use(express.json());
app.use(jsonErrorHandler);

// database setup
const db_url = 'mongodb://127.0.0.1:27017/packageTest';
await connectDatabase(db_url);

// secret config.
const secretsConfig = {
    jwtSecret: {
        secretKey: "i3nbhkgw8i3nbhkgw8",
        expireIn: "1d"
    },
    bcryptSecret: {
        saltRounds: 10
    }
};

app.use('/user', loginSignupFactory(DefaultUser, secretsConfig));
app.use('/user/post', postArticleFactory(DefaultUser, DefaultPost, secretsConfig));

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
