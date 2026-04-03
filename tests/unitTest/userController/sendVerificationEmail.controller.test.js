import { jest, describe, test, expect, beforeEach, beforeAll } from "@jest/globals";

jest.unstable_mockModule("../../../src/utils/dataExpiryTime.utils.js", () => ({
    dataExpiryTime: {
        otpLinkExpire: jest.fn()
    }
}));

jest.unstable_mockModule("../../../src/utils/validEmailRequest.utils.js", () => ({
    validEmailRequest: jest.fn()
}));

jest.unstable_mockModule("../../../src/utils/verificationMailSender.utils.js", () => ({
    verificationMailSender: {
        sendEmail: jest.fn()
    }
}));

jest.unstable_mockModule("../../../src/utils/verificationToken.utils.js", () => ({
    verificationToken: {
        saveSendToken: jest.fn()
    }
}));

let sendVerificationEmailController;
let dataExpiryTime, validEmailRequest, verificationMailSender, verificationToken;

beforeAll(async () => {
    dataExpiryTime = (await import("../../../src/utils/dataExpiryTime.utils.js")).dataExpiryTime;
    validEmailRequest = (await import("../../../src/utils/validEmailRequest.utils.js")).validEmailRequest;
    verificationMailSender = (await import("../../../src/utils/verificationMailSender.utils.js")).verificationMailSender;
    verificationToken = (await import("../../../src/utils/verificationToken.utils.js")).verificationToken;

    const controllerModule = await import(
        "../../../src/controllers/userControllers/sendVerificationEmail.controller.js"
    );

    sendVerificationEmailController = controllerModule.default;
});

describe("Send Verification Email Controller Snapshot Test", () => {
    let req, res, UserModel, controller;
    const sanitizeResponse = (res) => ({
        status: res.status.mock.calls[0][0],
        body: res.json.mock.calls[0][0]
    });
    beforeEach(() => {
        req = {
            params: { userId: "123" }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        UserModel = {
            findById: jest.fn(),
            findByIdAndDelete: jest.fn()
        };
        const userSecretConfig = {};
        const emailSender = {};
        const verifyMethod = {
            usingLink: false,
            otpLinkExpiryMinutes: 10
        };
        controller = sendVerificationEmailController(
            UserModel,
            userSecretConfig,
            emailSender,
            verifyMethod
        );
        jest.clearAllMocks();
    });

    test("for user not found.", async () => {
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(null)
        });
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for email already verified.", async () => {
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                emailVerified: true
            })
        });
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for destroyDataAfter expired and delete user.", async () => {
        const mockUser = {
            _id: "123",
            emailVerified: false,
            destroyDataAfter: Date.now() - 1000
        };
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser)
        });
        await controller(req, res);
        expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith("123");
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for otp request limit.", async () => {
        validEmailRequest.mockReturnValue(false);
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                emailVerified: false,
                destroyDataAfter: Date.now() + 10000
            })
        });
        await controller(req, res);
        expect(validEmailRequest).toHaveBeenCalled();
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for success.", async () => {
        validEmailRequest.mockReturnValue(true);
        const mockUser = {
            _id: "123",
            fullname: "Test User",
            email: "test@gmail.com",
            emailVerified: false,
            destroyDataAfter: Date.now() + 10000,
            otpRequestCount: 1,
            save: jest.fn()
        };
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser)
        });
        verificationToken.saveSendToken.mockResolvedValue({
            saveToken: "hashedToken",
            sendToken: "123456"
        });
        dataExpiryTime.otpLinkExpire.mockReturnValue("futureTime");
        await controller(req, res);
        expect(verificationToken.saveSendToken).toHaveBeenCalled();
        expect(verificationMailSender.sendEmail).toHaveBeenCalled();
        expect(mockUser.save).toHaveBeenCalled();
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for server error.", async () => {
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockRejectedValue(new Error("DB error"))
        });
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });
});