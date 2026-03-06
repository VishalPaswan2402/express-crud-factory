# Express CRUD Factory

A **practice-ready backend API kit** designed for developers who want to **learn secure API integration using real-world authentication and CRUD operations**.

This package provides a **ready-to-use backend with User Authentication and Post/Article APIs**, making it easy for frontend developers to practice working with APIs.

**It is ideal for developers learning:**

-   API Integration
    
-    Testing frontend with real APIs
    
-   CRUD operations
    
-   Full Stack Development


## Why This Package?
Many frontend developers struggle to practice API integration because they don't have a backend.

**Express-crud-factory solves this problem.**

It provides a **simple backend API system** that you can connect with:

-   React
    
-   Angular
    
-   Vue
    
-   Next.js

This allows you to **practice real production-like API workflows**.

## Features

-   User Registration API

-   Post / Article CRUD APIs
    
-   Clean Controller Architecture
    
-   Beginner Friendly
    
-   Easy to integrate
    
-   Built with Express and MongoDB
    
-   Ideal for learning API integration

## Installation

Install all these required dependencies after project setup :

You can try the package instantly using the starter repository.
GitHub Quick Setup Project:
[https://github.com/VishalPaswan2402/express-crud-factory](https://github.com/VishalPaswan2402/express-crud-factory)

```
npm init
```
```
npm install
```
```
npm install express mongoose cors dotenv
```

```
npm install express-crud-factory
```

## Quick Start

Import installed dependencies :
```
import express from "express";
import mongoose from "mongoose";
import { loginSignupFactory, postArticleFactory } from  "express-crud-factory";

const app = express();
app.use(express.json());
```

JSON Validation
```
app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON format"
        });
    }
    next(err);
});
```

MongoDB database connection setup :
```
const  db_url  =  'mongodb://127.0.0.1:27017/crudTest';
mongooseFunction()
	.then(() => {
		console.log("Connected to crud-test DB")
	})
	.catch((err) => {
		console.log(err);
	});
async  function  mongooseFunction() {
await  mongoose.connect(db_url);
};
```
Secure API  Practice Kit setup :
```
const  userAPI  =  loginSignupFactory(UserModel);  
const  postAPI  =  postArticleFactory(UserModel,PostModel);

app.use("/user", userAPI);
app.use("/user/post", postAPI);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

Run your backend application :
```
node index.js
```

Your API will now be available at:

```
Server is running on port 3000
```

## API Endpoints
```
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

## Project Structure
```
express-crud-factory-quickstart
│
├── models
│   ├── user.model.js
│   └── post.model.js
│
├── index.js
├── package.json
├── .gitignore
├── .env.example
└── README.md
```

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

## Contributing

Contributions are welcome.

Steps:

1.  Fork the repository
    
2.  Create a new branch
    
3.  Make improvements
    
4.  Submit a Pull Request

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
