import { beforeEach, describe, expect, jest, test, afterEach } from '@jest/globals';

import {
    checkUserExistByUsernameController,
    checkUserExistByEmailController,
} from "../../../src/controllers/userControllers/checkUserExist.controller.js";

jest.unstable_mockModule("../../../src/utils/emailTokenGenerator.utils.js", () => ({
    emailTokenGenerator: {
        validEmail: jest.fn()
    }
}));

let emailTokenGenerator;

beforeAll(async () => {
    emailTokenGenerator = (await import(
        "../../../src/utils/emailTokenGenerator.utils.js"
    )).emailTokenGenerator;
});

describe("Check User Exist Controllers", () => {
    let req;
    let res;
    let UserModel;
    const sanitizeResponse = (res) => {
        const body = { ...res.json.mock.calls[0][0] };
        if (body?.data?._id) body.data._id = "mocked-id";
        if (body?.data?.userId) body.data.userId = "mocked-user-id";
        return {
            status: res.status.mock.calls[0][0],
            body,
        };
    };
    beforeEach(() => {
        req = {
            body: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        UserModel = {
            findOne: jest.fn(),
        };
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("test by username", () => {
        test("for username is not provided", async () => {
            const controller =
                checkUserExistByUsernameController(UserModel);
            await controller(req, res);
            expect(sanitizeResponse(res)).toMatchSnapshot();
        });

        test("for username does not exist", async () => {
            req.body.username = "user1";
            UserModel.findOne.mockResolvedValue(null);
            const controller =
                checkUserExistByUsernameController(UserModel);
            await controller(req, res);
            expect(sanitizeResponse(res)).toMatchSnapshot();
        });

        test("for username already exists", async () => {
            req.body.username = "user1";
            UserModel.findOne.mockResolvedValue({
                username: "user1",
            });
            const controller =
                checkUserExistByUsernameController(UserModel);
            await controller(req, res);
            expect(sanitizeResponse(res)).toMatchSnapshot();
        });

        test("for server error", async () => {
            req.body.username = "user1";
            UserModel.findOne.mockRejectedValue(
                new Error("Database Error")
            );
            const controller =
                checkUserExistByUsernameController(UserModel);
            await controller(req, res);
            expect(sanitizeResponse(res)).toMatchSnapshot();
        });
    });

    describe("test by email", () => {
        test("for email is not provided", async () => {
            const controller =
                checkUserExistByEmailController(UserModel);
            await controller(req, res);
            expect(sanitizeResponse(res)).toMatchSnapshot();
        });

        test("for email format is invalid", async () => {
            req.body.email = "invalid-email";
            emailTokenGenerator.validEmail.mockReturnValue(false);
            const controller =
                checkUserExistByEmailController(UserModel);
            await controller(req, res);
            expect(sanitizeResponse(res)).toMatchSnapshot();
        });

        test("for email does not exist", async () => {
            req.body.email = "user1@gmail.com";
            emailTokenGenerator.validEmail.mockReturnValue(true);
            UserModel.findOne.mockResolvedValue(null);
            const controller =
                checkUserExistByEmailController(UserModel);
            await controller(req, res);
            expect(sanitizeResponse(res)).toMatchSnapshot();
        });

        test("for email already exists", async () => {
            req.body.email = "user1@gmail.com";
            emailTokenGenerator.validEmail.mockReturnValue(true);
            UserModel.findOne.mockResolvedValue({
                email: "user1@gmail.com",
            });
            const controller =
                checkUserExistByEmailController(UserModel);
            await controller(req, res);
            expect(sanitizeResponse(res)).toMatchSnapshot();
        });

        test("for server error", async () => {
            req.body.email = "user1@gmail.com";
            emailTokenGenerator.validEmail.mockReturnValue(true);
            UserModel.findOne.mockRejectedValue(
                new Error("Database Error")
            );
            const controller =
                checkUserExistByEmailController(UserModel);
            await controller(req, res);
            expect(sanitizeResponse(res)).toMatchSnapshot();
        });
    });
});