import { jest, describe, test, expect, beforeEach, beforeAll } from "@jest/globals";

jest.unstable_mockModule("../../../src/utils/verificationToken.utils.js", () => ({
    verificationToken: {
        saveSendToken: jest.fn(async () => ({
            saveToken: "mock-save-token",
            sendToken: "mock-send-token"
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
        otpLinkExpire: jest.fn(() => Date.now() + 10000)
    }
}));

jest.unstable_mockModule("../../../src/utils/validEmailRequest.utils.js", () => ({
    validEmailRequest: jest.fn(() => true)
}));

let recoverPasswordController;
let verificationToken;
let verificationMailSender;
let validEmailRequest;

beforeAll(async () => {
    recoverPasswordController = (await import(
        "../../../src/controllers/userControllers/recoverPassword.controller.js"
    )).default;

    verificationToken = (await import(
        "../../../src/utils/verificationToken.utils.js"
    )).verificationToken;

    verificationMailSender = (await import(
        "../../../src/utils/verificationMailSender.utils.js"
    )).verificationMailSender;

    validEmailRequest = (await import(
        "../../../src/utils/validEmailRequest.utils.js"
    )).validEmailRequest;
});

describe("Recover Password Controller Snapshot Test", () => {
    let req, res, Model;
    const verifyMethod = {
        usingLink: true,
        otpLinkExpiryMinutes: 10
    };
    const userSecretConfig = {};
    const emailSender = {};
    const sanitizeResponse = (res) => {
        const body = { ...res.json.mock.calls[0][0] };
        if (body?.data?.userId) body.data.userId = "mocked-user-id";
        return {
            status: res.status.mock.calls[0][0],
            body
        };
    };
    const mockFindOne = (data) => ({
        select: jest.fn().mockResolvedValue(data)
    });
    beforeEach(() => {
        req = {
            body: {
                usernameOrEmail: "test@gmail.com"
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
        jest.clearAllMocks();
    });

    test("for missing usernameOrEmail", async () => {
        req.body.usernameOrEmail = "";
        const controller = recoverPasswordController(
            Model,
            userSecretConfig,
            emailSender,
            verifyMethod
        );
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for user not found", async () => {
        Model.findOne.mockReturnValue(mockFindOne(null));
        const controller = recoverPasswordController(
            Model,
            userSecretConfig,
            emailSender,
            verifyMethod
        );
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for email not verified (not expired)", async () => {
        Model.findOne.mockReturnValue(
            mockFindOne({
                emailVerified: false,
                destroyDataAfter: Date.now() + 10000
            })
        );
        const controller = recoverPasswordController(
            Model,
            userSecretConfig,
            emailSender,
            verifyMethod
        );
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for email not verified and expired", async () => {
        Model.findOne.mockReturnValue(
            mockFindOne({
                _id: "123",
                emailVerified: false,
                destroyDataAfter: Date.now() - 1000
            })
        );
        Model.findByIdAndDelete.mockResolvedValue(true);
        const controller = recoverPasswordController(
            Model,
            userSecretConfig,
            emailSender,
            verifyMethod
        );
        await controller(req, res);
        expect(Model.findByIdAndDelete).toHaveBeenCalledWith("123");
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for inactive user", async () => {
        Model.findOne.mockReturnValue(
            mockFindOne({
                emailVerified: true,
                isActive: false
            })
        );
        const controller = recoverPasswordController(
            Model,
            userSecretConfig,
            emailSender,
            verifyMethod
        );
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for OTP request exceeded", async () => {
        validEmailRequest.mockReturnValue(false);
        Model.findOne.mockReturnValue(
            mockFindOne({
                emailVerified: true,
                isActive: true
            })
        );
        const controller = recoverPasswordController(
            Model,
            userSecretConfig,
            emailSender,
            verifyMethod
        );
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for successful recover password request", async () => {
        validEmailRequest.mockReturnValue(true);
        const mockSave = jest.fn();
        const mockUser = {
            _id: "userId",
            email: "test@gmail.com",
            fullname: "Test User",
            emailVerified: true,
            isActive: true,
            otpRequestCount: 1,
            save: mockSave
        };
        mockSave.mockResolvedValue(mockUser);
        Model.findOne.mockReturnValue(mockFindOne(mockUser));
        const controller = recoverPasswordController(
            Model,
            userSecretConfig,
            emailSender,
            verifyMethod
        );
        await controller(req, res);
        expect(verificationToken.saveSendToken).toHaveBeenCalled();
        expect(verificationMailSender.sendEmail).toHaveBeenCalled();
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for database error", async () => {
        Model.findOne.mockReturnValue({
            select: jest.fn().mockRejectedValue(new Error("DB error"))
        });
        const controller = recoverPasswordController(
            Model,
            userSecretConfig,
            emailSender,
            verifyMethod
        );
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });
});