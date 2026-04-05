import { jest, describe, test, expect, beforeEach, afterEach } from "@jest/globals";

jest.unstable_mockModule("../../../src/utils/verificationToken.utils.js", () => ({
    verificationToken: {
        saveSendToken: jest.fn(async () => ({
            saveToken: "mocked-save-token",
            sendToken: "mocked-send-token"
        }))
    }
}));

jest.unstable_mockModule("../../../src/utils/verificationMailSender.utils.js", () => ({
    verificationMailSender: {
        sendEmail: jest.fn(async () => true)
    }
}));

jest.unstable_mockModule("../../../src/utils/dataExpiryTime.utils.js", () => ({
    dataExpiryTime: {
        otpLinkExpire: jest.fn(() => Date.now() + 10000),
        userDataExpire: jest.fn(() => Date.now() + 20000)
    }
}));

const { verificationToken } = await import("../../../src/utils/verificationToken.utils.js");
const { verificationMailSender } = await import("../../../src/utils/verificationMailSender.utils.js");

import createUserController from "../../../src/controllers/userControllers/createUser.controller";
import { passwordHashing } from "../../../src/utils/passwordHashing.utils";

describe("Create User Controller Snapshot Test", () => {
    let req, res, Model;
    const mockFindOne = (data) => ({
        select: jest.fn().mockResolvedValue(data)
    });
    const sanitizeResponse = (res) => {
        const body = { ...res.json.mock.calls[0][0] };
        if (body?.data?._id) body.data._id = "mocked-id";
        if (body?.data?.userId) body.data.userId = "mocked-user-id";
        return {
            status: res.status.mock.calls[0][0],
            body
        };
    };
    beforeEach(() => {
        req = {
            body: {
                email: "test@gmail.com",
                username: "test",
                fullname: "UserTest",
                password: "testPassword",
                confirmPassword: "testPassword"
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        Model = {
            findOne: jest.fn(),
            findByIdAndDelete: jest.fn()
        };
        jest.spyOn(passwordHashing, "hashPassword")
            .mockResolvedValue("hashedPassword");
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("for missing fields", async () => {
        req.body.email = "";
        const controller = createUserController(Model);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("for password mismatch", async () => {
        req.body.confirmPassword = "wrong";
        const controller = createUserController(Model);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("user already exists", async () => {
        Model.findOne.mockReturnValue(
            mockFindOne({ emailVerified: true })
        );
        const controller = createUserController(Model);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("delete expired unverified user and create new", async () => {
        Model.findOne.mockReturnValue(
            mockFindOne({
                _id: "123",
                emailVerified: false,
                destroyDataAfter: Date.now() - 1000
            })
        );
        Model.findByIdAndDelete.mockResolvedValue(true);
        const mockSave = jest.fn().mockResolvedValue({
            _id: "userId",
            email: req.body.email
        });
        const MockModel = jest.fn(function (data) {
            return {
                ...data,
                save: mockSave
            };
        });
        MockModel.findOne = Model.findOne;
        MockModel.findByIdAndDelete = Model.findByIdAndDelete;
        const controller = createUserController(MockModel);
        await controller(req, res);
        expect(Model.findByIdAndDelete).toHaveBeenCalledWith("123");
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("successful user creation", async () => {
        Model.findOne.mockReturnValue(mockFindOne(null));
        const mockSave = jest.fn().mockResolvedValue({
            _id: "userId",
            email: req.body.email
        });
        const MockModel = jest.fn(function (data) {
            return {
                ...data,
                save: mockSave
            };
        });
        MockModel.findOne = Model.findOne;
        const controller = createUserController(MockModel);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("database error → 500", async () => {
        Model.findOne.mockReturnValue({
            select: jest.fn().mockRejectedValue(new Error("DB error"))
        });
        const controller = createUserController(Model);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });
});