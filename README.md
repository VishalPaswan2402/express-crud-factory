<img src="./assets/logo.png" alt="Express CRUD Factory Starter Logo" width="100%"/>

# Secure API Practice Kit
[![Npm Pa](https://img.shields.io/badge/NPM-Package-blue)](https://www.npmjs.com/package/express-crud-factory) [![Project Downloads](https://img.shields.io/npm/dt/express-crud-factory?label=Project%20Setup%20Downloads)](https://github.com/VishalPaswan2402/express-crud-factory-setup)  [![License](https://img.shields.io/npm/l/express-crud-factory?label=License)](https://express-crud-factory-license.onrender.com/) [![Contributors](https://img.shields.io/badge/Contributors-1-orange)](https://github.com/VishalPaswan2402)


A **practice-ready backend API kit** designed for developers who want to **learn secure API integration using real-world authentication and CRUD operations**.

This package provides a **ready-to-use backend with User Authentication and Post/Article APIs along with email verification using link or OTP**, making it easy for frontend developers to practice working with APIs.

**It is ideal for developers learning:**

-   API Integration
    
-    Testing frontend with real APIs
    
-   CRUD operations
    
-   Full Stack Development


## Why this package ?
Many frontend developers struggle to practice API integration because they don't have a backend.

**Express-Crud-Factory solves this problem.**

It provides a **simple and secure backend API system** that you can connect with:

-   React
    
-   Angular
    
-   Vue
    
-   Next.js

This allows you to **practice real production-like API workflows**.

## Features

- #### Plug & Play Backend
    - Ready-to-use Express CRUD APIs
    - Minimal setup required
    - Perfect for frontend developers

- #### Authentication Made Simple
    - Signup & Login APIs
    - JWT-based authentication
    - Easy integration with frontend apps

- #### Email Verification (2 Methods)
  - OTP-based verification
  - Email link verification
  - Choose what fits your project

- #### Resend Verification Support
  - Resend OTP or email verification link
  - Smooth user onboarding experience

- #### Forgot Password Flow
  - Reset password using OTP or email link
  - Secure and beginner-friendly implementation

- #### User CRUD APIs
  - Create, read, update, delete users
  - Ready for direct frontend consumption

- #### Post / Article CRUD APIs
  - Full CRUD support for posts/articles
  - Great for blogs or content apps

- #### Pagination Support
  - Fetch data with page & limit
  - Optimized for large datasets

- #### Built-in Validations
  - Email format validation
  - Strong password rules
  - Clean error responses for frontend handling

- #### Factory Pattern Architecture
  - Reusable controllers
  - Easily extend to new models

- #### Frontend-Friendly Responses
  - Consistent API response structure
  - Easy to handle in React, Vue, etc.

- #### Built for Learning
  - Understand real-world backend flows
  - Great for practice projects & portfolio

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
import cors from "cors";
import { loginSignupFactory, postArticleFactory, jsonErrorHandler, connectDatabase } from "express-crud-factory";
import UserModel from './models/user.model.js';  // import your user model schema. 
import PostModel from './models/post.model.js';  // import your post article model schema.

const app = express();

const backend_port = 3000;
const frontend_base_url = `your_frontend_base_url`;
const database_url = 'your_mongoDB_database_url';

app.use(cors({ origin: frontend_base_url }));
app.use(express.json());
app.use(jsonErrorHandler);
await connectDatabase(database_url);

// jwt secret and hashing configuration
const secretsConfig = {
    jwtSecret: {
        secretKey: "a-string-secret-at-least-256-bits-long", // secret key for jwt signature
        expireInDays: 1  // token expire in days
    },
    bcryptSecret: {
        saltRounds: 10 // hashing salt round
    }
}

// email and verify method configuration
const emailConfig = {
    mailProvider: {
        host: "your_email_host", // your email host provider
        secure: false, // assign true value in production
        username: "your_email_username", // your email username
        password: "your_email_password" // your email password
    },
    verifyMethod: {
        projectName: "Express-Crud-Factory", // your project name
        otpLinkExpiryMinutes: 2, // otp expires in minutes
        unverifiedUserExpiryDays: 1, // user deleted if email is not verified in days
        usingLink: true, // true -> link verification method and false -> OTP verification method
        frontendBaseUrl: frontend_base_url // ( use if usinglink = true  else optional)
    }
}

const userAPI = loginSignupFactory(UserModel,PostModel, secretsConfig, emailConfig);
const postAPI = postArticleFactory(UserModel, PostModel, secretsConfig);

app.use("/user", userAPI);
app.use("/user/post", postAPI);

app.listen(backend_port, () => {
    console.log("Server is running on port...", backend_port)
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
    isActive: { type: Boolean,default: false },
    emailVerified: { type: Boolean,default: false },
    verifyToken: { type: String,default: null,select: false },
    verifyTokenType: { type: String,default: null,select: false },
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

#### 6. Run your backend application from terminal :
```
node index.js
```

#### 7. After successful run you will see :
```
MongoDB database connected successfully
Server is running on port 3000
```

## Email Testing (Using Ethereal) :
This project uses Ethereal Email for testing email functionality during development.

Ethereal is a fake SMTP service — it allows you to send emails without actually delivering them to real users.

### Follow these Steps to Use :
Go to [https://ethereal.email/](https://ethereal.email/)

Click on "Create Ethereal Account"

You will get account credentials like :

```
Name: your_test_name
Username: your_test_email@ethereal.email
Password: yourtest__password
```
### Configure these values in index.js file :

```
mailProvider: {
    host: "smtp.ethereal.email",
    secure: false,
    username: "your_test_email@ethereal.email",
    password: "yourtest__password"
}
```

### Viewing Sent Emails :
After setup click on "Open Mailbox" to to see the emails.

After sending open that mail to see OTP and links for verification.

### Note :
Emails are not sent to real users.

Accounts are temporary.

Only for development/testing purposes.

## API end-points

#### User API Endpoints :
This section outlines all available User API endpoints used for authentication, account management, email verification, OTP handling, account deletion, and password recovery. These endpoints follow RESTful principles and support key user workflows such as signup, login, email verification, account destruction, and recovery, ensuring secure and structured interaction between the client and server.

```
POST Request     :   /user/signup
POST Request     :   /user/signup/send-verification
POST Request     :   /user/signup/link/verify-email
POST Request     :   /user/signup/otp/verify-email
POST Request     :   /user/login
GET  Request     :   /user/:userId/profile
POST Request     :   /user/:userId/delete-account/send-verification
POST Request     :   /user/delete-account/link/verify-email
POST Request     :   /user/:userId/delete-account/otp/verify-email
POST Request     :   /user/forgot-password
POST Request     :   /user/forgot-password/send-verification
POST Request     :   /user/reset-password/link/verify-email
POST Request     :   /user/reset-password/otp/verify-email
```

#### Post Articles API Endpoints :
This section defines all Post Articles API endpoints used for creating, retrieving, updating, searching, and deleting user posts. It includes features like post creation, editing, pinning, trashing, sharing, and fetching posts (single or multiple), along with pagination support for efficiently handling large datasets, while maintaining proper user-based access control.

```
POST Request     :   /user/post/:userId/new-post
GET Request      :   /user/post/:userId/:postId/get-post
GET Request      :   /user/post/:userId/all-post?page=1&limit=10
GET Request      :   /user/post/:postId/view/shared-post
PATCH Request    :   /user/post/:userId/:postId/edit-post
PATCH Request    :   /user/post/:userId/:postId/pin-post
PATCH Request    :   /user/post/:userId/:postId/trash-post
DELETE Request   :   /user/post/:userId/:postId/delete-post
GET Request      :   /user/post/:userId/search?text=title&page=1&limit=10
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

This project is licensed under the MIT License. 

[https://express-crud-factory-license.onrender.com/](https://express-crud-factory-license.onrender.com/)
  
Copyright (c) 2026 Vishal Paswan


## Author

**Vishal Paswan**
Web Developer  
Passionate about building interactive and practical developer tools.

## Support

⭐ If this project helps you, consider giving it a star on [GitHub.](https://github.com/VishalPaswan2402/express-crud-factory)

Your support helps improve the project and motivates further development.