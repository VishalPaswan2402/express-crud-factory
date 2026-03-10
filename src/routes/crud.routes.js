import express from 'express';
import jsonValidate from '../middlewares/jsonValidate.middleware.js';
import { authorizeUser } from '../middlewares/authorizeUser.middleware.js';
import isValidUserPostId from '../middlewares/validUserPostId.middleware.js';
import loginUserController from '../controllers/userControllers/loginUser.controller.js';
import createUserController from '../controllers/userControllers/createUser.controller.js';
import getUserByIdController from '../controllers/userControllers/getUserById.controller.js';
import destroyUserController from '../controllers/userControllers/destroyUser.controller.js';
import { authenticateUser } from '../middlewares/authenticateUser.middleware.js';
import createPostController from '../controllers/postControllers/createPost.controller.js';
import deletePostController from '../controllers/postControllers/deletePost.controller.js';
import sharePostController from '../controllers/postControllers/sharePost.controller.js';
import markPostController from '../controllers/postControllers/markPost.controller.js';
import editPostController from '../controllers/postControllers/editPost.controller.js';
import allPostController from '../controllers/postControllers/allPost.controller.js';
import getPostController from '../controllers/postControllers/getPost.controller.js';
import isValidUserId from '../middlewares/validUserId.middleware.js';
import isValidPostId from '../middlewares/validPostId.middleware.js';

function loginSignupApi(UserModel, userSecretConfig) {
    const router = express.Router({ mergeParams: true });
    router.post("/login", jsonValidate, loginUserController(UserModel, userSecretConfig));
    router.post("/signup", jsonValidate, createUserController(UserModel, userSecretConfig));
    router.get("/:userId", isValidUserId, authenticateUser(userSecretConfig.jwtSecret), authorizeUser, getUserByIdController(UserModel));
    router.delete("/:userId", isValidUserId, authenticateUser(userSecretConfig.jwtSecret), authorizeUser, destroyUserController(UserModel));
    return router;
}

function postArticleAPI(UserModel, PostModel, userSecretConfig) {
    const router = express.Router({ mergeParams: true });
    router.post("/:userId/new-post", jsonValidate, isValidUserId, authenticateUser(userSecretConfig.jwtSecret), authorizeUser, createPostController(UserModel, PostModel));
    router.get("/:userId/:postId/get-post", isValidUserPostId, authenticateUser(userSecretConfig.jwtSecret), authorizeUser, getPostController(UserModel, PostModel));
    router.get("/:userId/all-post", isValidUserId, authenticateUser(userSecretConfig.jwtSecret), authorizeUser, allPostController(UserModel, PostModel));
    router.get("/:postId/share-post", isValidPostId, sharePostController(PostModel));
    router.patch("/:userId/:postId/edit-post", jsonValidate, isValidUserPostId, authenticateUser(userSecretConfig.jwtSecret), authorizeUser, editPostController(UserModel, PostModel));
    router.patch("/:userId/:postId/pin-post", isValidUserPostId, authenticateUser(userSecretConfig.jwtSecret), authorizeUser, markPostController(UserModel, PostModel, false));
    router.patch("/:userId/:postId/trash-post", isValidUserPostId, authenticateUser(userSecretConfig.jwtSecret), authorizeUser, markPostController(UserModel, PostModel, true));
    router.delete("/:userId/:postId/delete-post", isValidUserPostId, authenticateUser(userSecretConfig.jwtSecret), authorizeUser, deletePostController(UserModel, PostModel));
    return router;
}

export { loginSignupApi, postArticleAPI };
