<img src="./assets/logo.png" alt="Express CRUD Factory Starter Logo" width="100%"/>

# Secure API Practice Kit
[![Npm Pa](https://img.shields.io/badge/NPM-Package-blue)](https://www.npmjs.com/package/express-crud-factory) [![Project Downloads](https://img.shields.io/npm/dt/express-crud-factory?label=Project%20Setup%20Downloads)](https://github.com/VishalPaswan2402/express-crud-factory-setup)  [![License](https://img.shields.io/npm/l/express-crud-factory?label=License)](https://www.npmjs.com/package/express-crud-factory) [![Contributors](https://img.shields.io/badge/Contributors-1-orange)](https://github.com/VishalPaswan2402)


A **practice-ready backend API kit** designed for developers who want to **learn secure API integration using real-world authentication and CRUD operations**.

This package provides a **ready-to-use backend with User Authentication and Post/Article APIs**, making it easy for frontend developers to practice working with APIs.

**It is ideal for developers learning:**

-   API Integration
    
-    Testing frontend with real APIs
    
-   CRUD operations
    
-   Full Stack Development


## Why This Package?
Many frontend developers struggle to practice API integration because they don't have a backend.

**Secure API Practice Kit solves this problem.**

It provides a **simple backend API system** that you can connect with:

-   React
    
-   Angular
    
-   Vue
    
-   Next.js

This allows you to **practice real production-like API workflows**.

## Features

-   Rapidly create CRUD endpoints for any Mongoose model
    
-   Modular and easy-to-integrate with existing Express apps
    
-   Fully customizable for middleware, validation, and custom logic
    
-   Reduces boilerplate code, saving development time

## Installation

Using npm  
```
npm install express-crud-factory  
```
Or using yarn  
```
yarn add express-crud-factory
```

## Full Setup Example

For a complete, working example of this setup, check out the starter repository :

Express-Crud-Factory-Starter :
[https://github.com/VishalPaswan2402/express-crud-factory-starter](https://github.com/VishalPaswan2402/express-crud-factory-starter)

You can clone it and explore a fully configured project to see how everything works end-to-end.


## Kit Uses

**Basic starter code setup :**

```js
import express from 'express'
import mongoose from 'mongoose';
import { loginSignupFactory, postArticleFactory } from "express-crud-factory";
import UserModel from './models/user.model.js';
import PostModel from './models/post.model.js';

const app = express();
app.use(express.json());
const port = 3000;

app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON format"
        });
    }
    next(err);
});

const db_url = 'mongodb://127.0.0.1:27017/crudUserTest';
mongooseFunction()
    .then(() => {
        console.log("Connected to external-crud-test DB")
    })
    .catch((err) => {
        console.log(err);
    });
async function mongooseFunction() {
    await mongoose.connect(db_url);
};

const secretConfig = {
    jwtSecret: {
        secretKey: "123456789",
        expireIn: "1h"
    },
    bcryptSecret: {
        saltRounds: 10
    }
}

app.use("/user", loginSignupFactory(UserModel, secretConfig));
app.use("/user/post", postArticleFactory(UserModel, PostModel, secretConfig));

app.listen(port, () => {
    console.log("Testing server is running...", port)
})
```

User Model Schema :

```js
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String,required: true },
    fullname: {  type: String,required: true },
    email: { type: String,unique: true,required: true },
    password: { type: String,required: true,select: false },
    isActive: { type: Boolean,default: true },
    articles: [ {type: mongoose.Schema.Types.ObjectId,ref: "DefaultPost"} ]
});
const UserModel = mongoose.model("UserModel", userSchema);
export default UserModel;
```

Post Model Schema :

```js
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: { type: String,required: true },
    description: { type: String,required: true },
    author: { type: mongoose.Schema.Types.ObjectId,ref: "DefaultUser",required: true },
    likes: { type: Number,default: () => Math.floor(Math.random() * 1000 + 1) },
    comments: { type: Number,default: () => Math.floor(Math.random() * 100 + 1) },
    createdAt: { type: Date,default: Date.now() }
})
const PostModel =mongoose.model("PostModel", postSchema);
export default PostModel;
```

Install dependencies :
```
npm install express-crud-factory
```
Run your backend application :
```
node index.js
```
```
Server is running on port 3000
```

## API Endpoints

```py
# User API Endpoints
POST Request : /user/signup
GET Request : /user/:userId
POST Request : /user/login
DELETE Request : /user/:userId

# Post Articles API Endpoints
POST Request : /user/post/:userId/new-post
GET Request : /user/post/:userId/:postId/get-post
PUT Request : /user/post/:userId/:postId/edit-post
DELETE Request : /user/post/:userId/:postId/delete-post
```

## Full Setup / Starter Repository  :

For a full working example of setup and usage, visit :

[https://github.com/VishalPaswan2402/express-crud-factory-starter](https://github.com/VishalPaswan2402/express-crud-factory-starter)


## Projects You Can Build

Using this API you can practice building these following projects :

-   Blog Website
    
-   Notes Application
    
-   Article Platform

-   Social Media Feed
    
-   Full Stack MERN Apps

## Target Audience

This package is helpful for:

-   Frontend developers learning API integration
    
-   Students learning backend concepts
    
-   MERN stack learners

## License

This project is licensed under the ISC License.  
  
Copyright (c) 2026 Vishal Paswan


## Author

**Vishal Paswan**
Web Developer  
Passionate about building interactive and practical developer tools.

## Support

⭐ If this project helps you, consider giving it a star on [GitHub.](https://github.com/VishalPaswan2402/express-crud-factory)

Your support helps improve the project and motivates further development.