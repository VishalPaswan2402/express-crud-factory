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

export default function userRoutes(UserModel, userSecretConfig, emailSender, verifyMethod, emailTokenConfig) {
    const router = express.Router({ mergeParams: true });
    router.post(
        "/signup",
        jsonValidate,
        createUserController(UserModel, userSecretConfig, emailSender, verifyMethod, emailTokenConfig)
    );
    router.post(
        "/signup/send-verification",
        jsonValidate,
        sendVerificationEmailController(UserModel, userSecretConfig, emailSender, verifyMethod, 1, emailTokenConfig)
    );
    router.post(
        "/signup/link/verify-email",
        jsonValidate,
        verifySignupEmailController(UserModel, userSecretConfig, true, emailTokenConfig)
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
        authenticateUser(userSecretConfig.jwtSecret),
        authorizeUser,
        getUserByIdController(UserModel)
    );
    router.post(
        "/:userId/delete-account/send-verification",
        jsonValidate,
        isValidUserId,
        authenticateUser(userSecretConfig.jwtSecret),
        authorizeUser,
        sendVerificationEmailController(UserModel, userSecretConfig, emailSender, verifyMethod, 3, emailTokenConfig)
    );
    router.post(
        "/delete-account/link/verify-email",
        jsonValidate,
        verifyDestroyEmailController(UserModel, true, emailTokenConfig)
    );
    router.post(
        "/:userId/delete-account/otp/verify-email",
        jsonValidate,
        isValidUserId,
        authenticateUser(userSecretConfig.jwtSecret),
        authorizeUser,
        verifyDestroyEmailController(UserModel, false, emailTokenConfig)
    );
    router.post(
        "/forgot-password",
        jsonValidate,
        recoverPasswordController(UserModel, userSecretConfig, emailSender, verifyMethod, emailTokenConfig)
    );
    router.post(
        "/forgot-password/send-verification",
        jsonValidate,
        sendVerificationEmailController(UserModel, userSecretConfig, emailSender, verifyMethod, 2, emailTokenConfig)
    );
    router.post(
        "/reset-password/link/verify-email",
        jsonValidate,
        verifyRecoverEmailController(UserModel, true, userSecretConfig, emailTokenConfig)
    );
    router.post(
        "/reset-password/otp/verify-email",
        jsonValidate,
        verifyRecoverEmailController(UserModel, false, userSecretConfig, emailTokenConfig)
    );
    return router;
}