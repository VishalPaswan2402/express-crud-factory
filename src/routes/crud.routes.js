import express from 'express';
import isValidUserId from '../middlewares/validUserId.middleware.js';
import isValidUserPostId from '../middlewares/validUserPostId.middleware.js';
import loginUserController from '../controllers/userControllers/loginUser.controller.js';
import createUserController from '../controllers/userControllers/createUser.controller.js';
import getUserByIdController from '../controllers/userControllers/getUserById.controller.js';
import destroyUserController from '../controllers/userControllers/destroyUser.controller.js';
import createPostController from '../controllers/postControllers/createPost.controller.js';
import deletePostController from '../controllers/postControllers/deletePost.controller.js';
import editPostController from '../controllers/postControllers/editPost.controller.js';
import getPostController from '../controllers/postControllers/getPost.controller.js';
import jsonValidate from '../middlewares/jsonValidate.middleware.js';

function loginSignupApi(Model) {
    const router = express.Router({ mergeParams: true });
    router.post("/signup", jsonValidate, createUserController(Model));
    router.get("/:userId", isValidUserId, getUserByIdController(Model));
    router.post("/login", jsonValidate, loginUserController(Model));
    router.delete("/:userId", isValidUserId, destroyUserController(Model));
    return router;
}

function postArticleAPI(UserModel, PostModel) {
    const router = express.Router({ mergeParams: true });
    router.post("/:userId/new-post", jsonValidate, isValidUserId, createPostController(UserModel, PostModel));
    router.get("/:userId/:postId/get-post", isValidUserPostId, getPostController(UserModel, PostModel));
    router.put("/:userId/:postId/edit-post", jsonValidate, isValidUserPostId, editPostController(UserModel, PostModel));
    router.delete("/:userId/:postId/delete-post", isValidUserPostId, deletePostController(UserModel, PostModel));
    return router;
}

export { loginSignupApi, postArticleAPI };
