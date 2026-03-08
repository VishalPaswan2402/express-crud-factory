import express from "express";
import mongoose from 'mongoose';
import { loginSignupFactory, postArticleFactory } from "../src/index.js";
import DefaultUser from "./models/user.model.js";
import DefaultPost from "./models/postArticles.model.js";
const app = express();
app.use(express.json());

// Catch JSON syntax errors
app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON format"
        });
    }

    next(err);
});

// database setup
const db_url = 'mongodb://127.0.0.1:27017/packageTest';
mongooseFunction()
    .then(() => {
        console.log("Connected to crud-test DB")
    })
    .catch((err) => {
        console.log(err);
    });
async function mongooseFunction() {
    await mongoose.connect(db_url);
};

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
