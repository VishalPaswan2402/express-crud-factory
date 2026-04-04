<img src="./assets/logo.png" alt="Express CRUD Factory Starter Logo" width="100%"/>

# Secure API Practice Kit
[![Npm Pa](https://img.shields.io/badge/NPM-Package-blue)](https://www.npmjs.com/package/express-crud-factory) [![Project Downloads](https://img.shields.io/npm/dt/express-crud-factory?label=Project%20Setup%20Downloads)](https://github.com/VishalPaswan2402/express-crud-factory-setup)  [![License](https://img.shields.io/npm/l/express-crud-factory?label=License)](https://express-crud-factory-license.onrender.com/) [![Contributors](https://img.shields.io/badge/Contributors-1-orange)](https://github.com/VishalPaswan2402)


A **practice-ready backend API kit** designed for developers who want to **learn secure API integration using real-world authentication and CRUD operations**.

This package provides a **ready-to-use backend with User Authentication and Post/Article APIs**, making it easy for frontend developers to practice working with APIs.

**It is ideal for developers learning:**

-   API Integration
    
-    Testing frontend with real APIs
    
-   CRUD operations
    
-   Full Stack Development


## Why this package ?
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

## How to use factory

Project starter :

```js
import express from 'express'
import { loginSignupFactory, postArticleFactory, jsonErrorHandler, connectDatabase } from "express-crud-factory";
import UserModel from './models/user.model.js';
import PostModel from './models/post.model.js';

const port = 3000;
const app = express();
app.use(express.json());
app.use(jsonErrorHandler);

const db_url = 'mongodb://127.0.0.1:27017/expressCrudFactory';
await connectDatabase(db_url);

// jwt secret and hashing configuration
const secretConfig = {
    jwtSecret: {
        secretKey: "1jsd23owie45xnzbm67pqlmx89", // your secret key for jwt signature
        expireIn: "1h"  // token expire in hour
    },
    bcryptSecret: {
        saltRounds: 10 // hashing salt round
    }
}

// email and verify method configuration
const emailConfig = {
    mailProvider: {
        host: "smtp.ethereal.email", // your email host provider
        secure: false, // true in production
        username: "patrick.rice9@ethereal.email", // your email username
        password: "XXyT7k2dW1b1WyKxPB" // your email password
    },
    verifyMethod: {
        projectName: "Express-Crud-Factory", // your project name
        otpLinkExpiryMinutes: 2, // otp expires in minutes
        unverifiedUserExpiryDays: 1, // user destroyed if email not verified in days
        usingLink: true, // true -> link verification method , false -> OTP verification method
        frontendBaseUrl: `http://localhost:${port}` // use if usinglink = true , else optional
    }
}

app.use("/user", loginSignupFactory(UserModel, secretConfig, emailConfig));
app.use("/user/post", postArticleFactory(UserModel, PostModel, secretConfig));

app.listen(port, () => {
    console.log("Server is running on port...", port)
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
    emailVerified: { type: Boolean,default: false },
    verifyToken: { type: String,default: null,select: false },
    verifyTokenExpires: { type: Date,default: null,select: false },
    destroyDataAfter: { type: Date,default: null,select: false },
    otpRequestCount: { type: Number,default: 0,select: false },
    otpLastRequest: { type: Date,default: null,select: false },
    articles: [ {type: mongoose.Schema.Types.ObjectId,ref: "PostModel"} ]
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
    author: { type: mongoose.Schema.Types.ObjectId,ref: "UserModel",required: true },
    likes: { type: Number,default: () => Math.floor(Math.random() * 1000 + 1) },
    comments: { type: Number,default: () => Math.floor(Math.random() * 100 + 1) },
    isPinned: { type: Boolean,default: false },
    isTrashed: { type: Boolean,default: false },
    deletedAt: { type: Date,default: null }
},{ timestamps: true });

const PostModel =mongoose.model("PostModel", postSchema);
export default PostModel;
```

## Project setup

#### 1. Create a projectFolder and run this command in terminal :
```
npm init
```

#### 2. Changes in package.json file :
```
"type": "module"
```

#### 3. To install dependencies run command in terminal :
```
npm install express-crud-factory
```

#### 4. Create models folder and index.js files as given in project structure :
```
projectFolder 
│
├── models
│ 	└── post.model.js
│ 	└── user.model.js 
│   
├── index.js
├── package-lock.json
└── package.json  
```

#### 5. Content of files :

```
## In post.model.js file
Copy post model schema code.

## In user.model.js file
Copy user model schema code.

## In index.js file
Copy project starter code.
```

#### 6. Run your backend application :
```
node index.js
```

#### 7. After successful run you will see :
```
Server is running on port 3000
```

## API end-points

```
# User API Endpoints

POST Request     :   /user/signup
POST Request     :   /user/login
GET Request      :   /user/signup/verify-email
POST Request     :   /user/signup/:userId/send-email
POST Request     :   /user/destroy/:userId/send-email
POST Request     :   /user/signup/:userId/verify-email
GET Request      :   /user/:userId
POST Request     :   /user/destroy/:userId/verify-email
DELETE Request   :   /user/destroy/:userId/verify-email


# Post Articles API Endpoints

POST Request     :   /user/post/:userId/new-post
GET Request      :   /user/post/:userId/:postId/get-post
GET Request      :   /user/post/:userId/all-post
GET Request      :   /user/post/:postId/share-post
PATCH Request    :   /user/post/:userId/:postId/edit-post
PATCH Request    :   /user/post/:userId/:postId/pin-post
PATCH Request    :   /user/post/:userId/:postId/trash-post
DELETE Request   :   /user/post/:userId/:postId/delete-post
```

Visit [https://github.com/VishalPaswan2402/express-crud-factory-starter/tree/main/docs](https://github.com/VishalPaswan2402/express-crud-factory-starter/tree/main/docs) for detailed API request / response samples and use-cases.


## Quick setup with starter repository

For a full working example of setup and usage, visit :

[https://github.com/VishalPaswan2402/express-crud-factory-starter](https://github.com/VishalPaswan2402/express-crud-factory-starter)


## Projects you can build

Using this API you can practice building these following projects :

-   Blog Website
    
-   Notes Application
    
-   Article Platform

-   Social Media Feed
    
-   Full Stack MERN Apps

## Target audience

This package is helpful for:

-   Frontend developers learning API integration
    
-   Students learning backend concepts
    
-   MERN stack learners

## License

This project is licensed under the ISC License. 

[https://express-crud-factory-license.onrender.com/](https://express-crud-factory-license.onrender.com/)
  
Copyright (c) 2026 Vishal Paswan


## Author

**Vishal Paswan**
Web Developer  
Passionate about building interactive and practical developer tools.

## Support

⭐ If this project helps you, consider giving it a star on [GitHub.](https://github.com/VishalPaswan2402/express-crud-factory)

Your support helps improve the project and motivates further development.