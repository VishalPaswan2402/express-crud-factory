import express from "express";
import jsonValidate from "../middlewares/jsonValidate.middleware.js";
import createUserController from "../controllers/userControllers/createUser.controller.js";
import sendVerificationEmailController from "../controllers/userControllers/sendVerificationEmail.controller.js";
import verifySignupEmailController from "../controllers/userControllers/verifySignupEmail.controller.js";
import loginUserController from "../controllers/userControllers/loginUser.controller.js";
import { authenticateUser } from "../middlewares/authenticateUser.middleware.js";
import { authorizeUser } from "../middlewares/authorizeUser.middleware.js";
import getUserByIdController from "../controllers/userControllers/getUserById.controller.js";
import isValidUserId from "../middlewares/validUserId.middleware.js";
import verifyDestroyEmailController from "../controllers/userControllers/verifyDestroyEmail.controller.js";
import recoverPasswordController from "../controllers/userControllers/recoverPassword.controller.js";
import verifyRecoverEmailController from "../controllers/userControllers/verifyRecoverEmail.controller.js";
import refreshTokenController from "../controllers/userControllers/refreshToken.controller.js";
import logoutUserController from "../controllers/userControllers/logoutUser.controller.js";

export default function userRoutes(UserModel, ExpiredTokensModel, PostModel, userSecretConfig, emailSender, verifyMethod) {
    const router = express.Router({ mergeParams: true });
    router.post(
        "/signup",
        jsonValidate,
        createUserController(UserModel, userSecretConfig, emailSender, verifyMethod)
    );
    router.post(
        "/signup/send-verification",
        jsonValidate,
        sendVerificationEmailController(UserModel, userSecretConfig, emailSender, verifyMethod, 1)
    );
    router.post(
        "/signup/link/verify-email",
        jsonValidate,
        verifySignupEmailController(UserModel, userSecretConfig, true)
    );
    router.post(
        "/signup/otp/verify-email",
        jsonValidate,
        verifySignupEmailController(UserModel, userSecretConfig, false)
    );
    router.post(
        "/login",
        jsonValidate,
        loginUserController(UserModel, userSecretConfig)
    );
    router.get(
        "/:userId/profile",
        isValidUserId,
        authenticateUser(userSecretConfig.jwtSecret, ExpiredTokensModel),
        authorizeUser,
        getUserByIdController(UserModel)
    );
    router.post(
        "/:userId/delete-account/send-verification",
        jsonValidate,
        isValidUserId,
        authenticateUser(userSecretConfig.jwtSecret, ExpiredTokensModel),
        authorizeUser,
        sendVerificationEmailController(UserModel, userSecretConfig, emailSender, verifyMethod, 3)
    );
    router.post(
        "/delete-account/link/verify-email",
        jsonValidate,
        verifyDestroyEmailController(UserModel, PostModel, true)
    );
    router.post(
        "/:userId/delete-account/otp/verify-email",
        jsonValidate,
        isValidUserId,
        authenticateUser(userSecretConfig.jwtSecret, ExpiredTokensModel),
        authorizeUser,
        verifyDestroyEmailController(UserModel, PostModel, false)
    );
    router.post(
        "/forgot-password",
        jsonValidate,
        recoverPasswordController(UserModel, userSecretConfig, emailSender, verifyMethod)
    );
    router.post(
        "/forgot-password/send-verification",
        jsonValidate,
        sendVerificationEmailController(UserModel, userSecretConfig, emailSender, verifyMethod, 2)
    );
    router.post(
        "/reset-password/link/verify-email",
        jsonValidate,
        verifyRecoverEmailController(UserModel, true, userSecretConfig)
    );
    router.post(
        "/reset-password/otp/verify-email",
        jsonValidate,
        verifyRecoverEmailController(UserModel, false, userSecretConfig)
    );
    router.post(
        "/:userId/refresh-token",
        isValidUserId,
        refreshTokenController(UserModel, userSecretConfig)
    );
    router.post(
        "/:userId/logout",
        isValidUserId,
        authenticateUser(userSecretConfig.jwtSecret, ExpiredTokensModel),
        authorizeUser,
        logoutUserController(UserModel, ExpiredTokensModel)
    );
    return router;
}