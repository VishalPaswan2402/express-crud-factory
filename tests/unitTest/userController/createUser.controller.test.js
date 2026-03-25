import { jest, describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import createUserController from "../../../src/controllers/userControllers/createUser.controller";
import jsonValidate from "../../../src/middlewares/jsonValidate.middleware";
import { passwordHashing } from "../../../src/utils/passwordHashing.utils";

describe("Create User Controller Snapshot Test", () => {
    let req;
    let res;
    let Model;
    let next;
    let userSecretConfig;
    let emailSender;
    let verifyMethod;
    const mockFindOne = (data) => ({
        select: jest.fn().mockResolvedValue(data)
    });
    const sanitizeResponse = (res) => {
        const body = { ...res.json.mock.calls[0][0] };
        if (body?.data?.userId) {
            body.data.userId = "mocked-user-id";
        }
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
            findOne: jest.fn()
        };
        userSecretConfig = {
            jwtSecret: {
                secret: "test-secret",
                expireIn: "7d"
            },
            bcryptSecret: {
                salts: 10
            }
        };
        emailSender = {
            sendMail: jest.fn().mockResolvedValue(true),
            options: {
                auth: { user: "test@project.com" }
            }
        };
        verifyMethod = {
            usingLink: true,
            frontendBaseUrl: "http://localhost:3000",
            projectName: "TestApp",
            otpLinkExpiryMinutes: 10,
            unverifiedUserExpiryDays: 2
        };
        next = jest.fn();
        jest.spyOn(passwordHashing, "hashPassword").mockReset();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("for missing fields.", async () => {
        jsonValidate(req, res, next);
        req.body.email = "";
        const controller = createUserController(Model, userSecretConfig, emailSender, verifyMethod);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(next).toHaveBeenCalled();
        expect(result).toMatchSnapshot();
    });

    test("for password mismatch.", async () => {
        req.body.confirmPassword = "wrongPassword";
        const controller = createUserController(Model, userSecretConfig, emailSender, verifyMethod);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("for username already exist.", async () => {
        Model.findOne.mockReturnValue(
            mockFindOne({ username: "test", emailVerified: true })
        );
        const controller = createUserController(Model, userSecretConfig, emailSender, verifyMethod);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(Model.findOne).toHaveBeenCalledWith({
            $or: [
                { username: "test" },
                { email: "test@gmail.com" }
            ]
        });
        expect(result).toMatchSnapshot();
    });

    test("for email already exist.", async () => {
        Model.findOne.mockReturnValue(
            mockFindOne({ email: "test@gmail.com", emailVerified: true })
        );
        const controller = createUserController(Model, userSecretConfig, emailSender, verifyMethod);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("for empty request body.", () => {
        req.body = {};
        jsonValidate(req, res, next);
        const result = sanitizeResponse(res);
        expect(next).not.toHaveBeenCalled();
        expect(result).toMatchSnapshot();
    });

    test("for delete expired unverified user and create new one", async () => {
        Model.findOne.mockReturnValue(
            mockFindOne({
                _id: "123",
                emailVerified: false,
                destroyDataAfter: Date.now() - 1000
            })
        );
        Model.findByIdAndDelete = jest.fn().mockResolvedValue(true);
        jest.spyOn(passwordHashing, "hashPassword")
            .mockResolvedValue("hashedPassword");
        const mockSave = jest.fn().mockResolvedValue({ _id: "userId" });
        const MockModel = jest.fn(function (data) {
            return {
                ...data,
                save: mockSave
            };
        });
        MockModel.findOne = Model.findOne;
        MockModel.findByIdAndDelete = Model.findByIdAndDelete;
        const controller = createUserController(
            MockModel,
            userSecretConfig,
            emailSender,
            verifyMethod
        );
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(Model.findByIdAndDelete).toHaveBeenCalledWith("123");
        expect(mockSave).toHaveBeenCalled();
        expect(result).toMatchSnapshot();
    });

    test("for create user with OTP verification", async () => {
        verifyMethod.usingLink = false;
        Model.findOne.mockReturnValue(mockFindOne(null));
        jest.spyOn(passwordHashing, "hashPassword")
            .mockResolvedValue("hashedPassword");
        const mockSave = jest.fn().mockResolvedValue({ _id: "userId" });
        const MockModel = jest.fn(function (data) {
            return {
                ...data,
                save: mockSave
            };
        });
        MockModel.findOne = Model.findOne;
        const controller = createUserController(
            MockModel,
            userSecretConfig,
            emailSender,
            verifyMethod
        );
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
        expect(emailSender.sendMail).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("for handle email sending failure", async () => {
        Model.findOne.mockReturnValue(mockFindOne(null));
        emailSender.sendMail.mockRejectedValue(new Error("Email failed"));
        const mockSave = jest.fn().mockResolvedValue({ _id: "userId" });
        const MockModel = jest.fn(function (data) {
            return {
                ...data,
                save: mockSave
            };
        });
        MockModel.findOne = Model.findOne;
        const controller = createUserController(
            MockModel,
            userSecretConfig,
            emailSender,
            verifyMethod
        );
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test("for set verifyTokenExpires and destroyDataAfter", async () => {
        Model.findOne.mockReturnValue(mockFindOne(null));
        const mockSave = jest.fn().mockImplementation(function () {
            return Promise.resolve({
                ...this,
                _id: "userId"
            });
        });
        const MockModel = jest.fn(function (data) {
            return {
                ...data,
                save: mockSave
            };
        });
        MockModel.findOne = Model.findOne;
        const controller = createUserController(
            MockModel,
            userSecretConfig,
            emailSender,
            verifyMethod
        );
        await controller(req, res);
        const savedData = mockSave.mock.instances[0] || {};
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
        expect(savedData.verifyTokenExpires).toBeDefined();
        expect(savedData.destroyDataAfter).toBeDefined();
    });

    test("for send verification link in email", async () => {
        Model.findOne.mockReturnValue(mockFindOne(null));
        const mockSave = jest.fn().mockResolvedValue({ _id: "userId" });
        const MockModel = jest.fn(function (data) {
            return {
                ...data,
                save: mockSave
            };
        });
        MockModel.findOne = Model.findOne;
        const controller = createUserController(
            MockModel,
            userSecretConfig,
            emailSender,
            verifyMethod
        );
        await controller(req, res);
        const mailArgs = emailSender.sendMail.mock.calls[0][0];
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
        expect(mailArgs.html).toContain("http://localhost:3000");
    });

    test("for user created successfully.", async () => {
        Model.findOne.mockReturnValue(mockFindOne(null));
        jest.spyOn(passwordHashing, "hashPassword")
            .mockResolvedValue("hashedPassword");
        const mockSave = jest.fn().mockResolvedValue({
            _id: "507f1f77bcf86cd799439011"
        });
        const MockModel = jest.fn(function (data) {
            return {
                ...data,
                save: mockSave
            };
        });
        MockModel.findOne = Model.findOne;
        const controller = createUserController(
            MockModel,
            userSecretConfig,
            emailSender,
            verifyMethod
        );
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(passwordHashing.hashPassword)
            .toHaveBeenCalledWith(req.body.password, userSecretConfig.bcryptSecret);
        expect(result).toMatchSnapshot();
    });

    test("for user saving failed.", async () => {
        Model.findOne.mockReturnValue(mockFindOne(null));
        const mockSave = jest.fn().mockRejectedValue(new Error("Save failed"));
        const MockModel = jest.fn(function (data) {
            return {
                ...data,
                save: mockSave
            };
        });
        MockModel.findOne = Model.findOne;
        const controller = createUserController(
            MockModel,
            userSecretConfig,
            emailSender,
            verifyMethod
        );
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("for server error.", async () => {
        Model.findOne.mockReturnValue({
            select: jest.fn().mockRejectedValue(new Error("DB Error"))
        });
        const controller = createUserController(
            Model,
            userSecretConfig,
            emailSender,
            verifyMethod
        );
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });
});