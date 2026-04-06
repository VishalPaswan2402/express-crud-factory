import express from 'express';
import jsonValidate from '../middlewares/jsonValidate.middleware.js';
import { authorizeUser } from '../middlewares/authorizeUser.middleware.js';
import isValidUserPostId from '../middlewares/validUserPostId.middleware.js';
import loginUserController from '../controllers/userControllers/loginUser.controller.js';
import createUserController from '../controllers/userControllers/createUser.controller.js';
import getUserByIdController from '../controllers/userControllers/getUserById.controller.js';
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
import sendVerificationEmailController from '../controllers/userControllers/sendVerificationEmail.controller.js';
import verifySignupEmailController from '../controllers/userControllers/verifySignupEmail.controller.js';
import searchByTitleController from '../controllers/postControllers/searchByTitle.controller.js';
import recoverPasswordController from '../controllers/userControllers/recoverPassword.controller.js';
import verifyDestroyEmailController from '../controllers/userControllers/verifyDestroyEmail.controller.js';
import verifyRecoverEmailController from '../controllers/userControllers/verifyRecoverEmail.controller.js';

function loginSignupApi(UserModel, userSecretConfig, emailSender, verifyMethod) {
    const router = express.Router({ mergeParams: true });
    router.post("/login", jsonValidate, loginUserController(UserModel, userSecretConfig));
    router.get("/:userId", isValidUserId, authenticateUser(userSecretConfig.jwtSecret), authorizeUser, getUserByIdController(UserModel));
    router.post("/signup", jsonValidate, createUserController(UserModel, userSecretConfig, emailSender, verifyMethod));
    router.get("/signup/:userId/verify-email", isValidUserId, verifySignupEmailController(UserModel, userSecretConfig, true));
    router.post("/signup/:userId/send-email", isValidUserId, sendVerificationEmailController(UserModel, userSecretConfig, emailSender, verifyMethod, 1));
    router.post("/signup/:userId/verify-email", jsonValidate, isValidUserId, verifySignupEmailController(UserModel, userSecretConfig, false));
    router.post("/destroy/:userId/send-email", isValidUserId, authenticateUser(userSecretConfig.jwtSecret), authorizeUser, sendVerificationEmailController(UserModel, userSecretConfig, emailSender, verifyMethod, 3));
    router.post("/destroy/:userId/verify-email", jsonValidate, isValidUserId, authenticateUser(userSecretConfig.jwtSecret), authorizeUser, verifyDestroyEmailController(UserModel, false));
    router.delete("/destroy/:userId/verify-email", isValidUserId, verifyDestroyEmailController(UserModel, true));
    router.post("/recover-password", jsonValidate, recoverPasswordController(UserModel, userSecretConfig, emailSender, verifyMethod));
    router.post("/recover/:userId/send-email", isValidUserId, sendVerificationEmailController(UserModel, userSecretConfig, emailSender, verifyMethod, 2));
    router.post("/recover/:userId/verify-email", jsonValidate, isValidUserId, verifyRecoverEmailController(UserModel, true, userSecretConfig));
    router.post("/recover/:userId/otp/verify-email", jsonValidate, isValidUserId, verifyRecoverEmailController(UserModel, false, userSecretConfig));
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
    router.get("/:userId/search", isValidUserId, authenticateUser(userSecretConfig.jwtSecret), authorizeUser, searchByTitleController(PostModel));
    return router;
}

export { loginSignupApi, postArticleAPI };
