import express from "express";
import jsonValidate from "../middlewares/jsonValidate.middleware.js";
import isValidUserId from "../middlewares/validUserId.middleware.js";
import { authenticateUser } from "../middlewares/authenticateUser.middleware.js";
import { authorizeUser } from "../middlewares/authorizeUser.middleware.js";
import createPostController from "../controllers/postControllers/createPost.controller.js";
import isValidUserPostId from "../middlewares/validUserPostId.middleware.js";
import getPostController from "../controllers/postControllers/getPost.controller.js";
import allPostController from "../controllers/postControllers/allPost.controller.js";
import sharePostController from "../controllers/postControllers/sharePost.controller.js";
import editPostController from "../controllers/postControllers/editPost.controller.js";
import markPostController from "../controllers/postControllers/markPost.controller.js";
import deletePostController from "../controllers/postControllers/deletePost.controller.js";
import searchByTitleController from "../controllers/postControllers/searchByTitle.controller.js";
import isValidPostId from "../middlewares/validPostId.middleware.js";

export default function postRoutes(UserModel, ExpiredTokensModel, PostModel, userSecretConfig) {
    const router = express.Router({ mergeParams: true });
    router.post(
        "/:userId/new-post",
        jsonValidate,
        isValidUserId,
        authenticateUser(userSecretConfig.jwtSecret, ExpiredTokensModel),
        authorizeUser,
        createPostController(UserModel, PostModel)
    );
    router.get(
        "/:userId/:postId/get-post",
        isValidUserPostId,
        authenticateUser(userSecretConfig.jwtSecret, ExpiredTokensModel),
        authorizeUser,
        getPostController(UserModel, PostModel)
    );
    router.get(
        "/:userId/all-post",
        isValidUserId,
        authenticateUser(userSecretConfig.jwtSecret, ExpiredTokensModel),
        authorizeUser,
        allPostController(UserModel, PostModel)
    );
    router.get(
        "/:postId/view/shared-post",
        isValidPostId,
        sharePostController(PostModel)
    );
    router.patch(
        "/:userId/:postId/edit-post",
        jsonValidate,
        isValidUserPostId,
        authenticateUser(userSecretConfig.jwtSecret, ExpiredTokensModel),
        authorizeUser,
        editPostController(UserModel, PostModel)
    );
    router.patch(
        "/:userId/:postId/pin-post",
        isValidUserPostId,
        authenticateUser(userSecretConfig.jwtSecret, ExpiredTokensModel),
        authorizeUser,
        markPostController(UserModel, PostModel, false)
    );
    router.patch(
        "/:userId/:postId/trash-post",
        isValidUserPostId,
        authenticateUser(userSecretConfig.jwtSecret, ExpiredTokensModel),
        authorizeUser,
        markPostController(UserModel, PostModel, true)
    );
    router.delete(
        "/:userId/:postId/delete-post",
        isValidUserPostId,
        authenticateUser(userSecretConfig.jwtSecret, ExpiredTokensModel),
        authorizeUser,
        deletePostController(UserModel, PostModel)
    );
    router.get(
        "/:userId/search",
        isValidUserId,
        authenticateUser(userSecretConfig.jwtSecret, ExpiredTokensModel),
        authorizeUser,
        searchByTitleController(UserModel, PostModel)
    );
    return router;
}