import express from 'express';
import jsonValidate from '../middlewares/jsonValidate.middleware.js';
import { checkUserExistByEmailController, checkUserExistByUsernameController } from '../controllers/userControllers/checkUserExist.controller.js';

export default function checkUserExistRoutes(UserModel) {
    const router = express.Router({ mergeParams: true });
    router.post(
        "/username",
        jsonValidate,
        checkUserExistByUsernameController(UserModel)
    );
    router.post(
        "/email",
        jsonValidate,
        checkUserExistByEmailController(UserModel)
    );
    return router;
}