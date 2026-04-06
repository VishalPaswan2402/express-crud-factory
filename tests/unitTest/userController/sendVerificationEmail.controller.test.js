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
    let req, res, UserModel;
    const setupController = (create = 1, verifyMethodOverride = {}) => {
        const userSecretConfig = {};
        const emailSender = {};
        const verifyMethod = {
            usingLink: false,
            otpLinkExpiryMinutes: 10,
            ...verifyMethodOverride
        };
        return sendVerificationEmailController(
            UserModel,
            userSecretConfig,
            emailSender,
            verifyMethod,
            create
        );
    };
    beforeEach(() => {
        req = { params: { userId: "123" } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        UserModel = {
            findById: jest.fn(),
            findByIdAndDelete: jest.fn()
        };
        jest.clearAllMocks();
    });

    test("for user not found", async () => {
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(null)
        });
        const controller = setupController(1);
        await controller(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: "Looks like that user doesn't exist in our system.",
            success: false
        });
    });

    test("for email already verified", async () => {
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                emailVerified: true
            })
        });
        const controller = setupController(1);
        await controller(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Email already verified.",
            success: true
        });
    });

    test("for destroyDataAfter expired", async () => {
        const mockUser = {
            _id: "123",
            emailVerified: false,
            destroyDataAfter: Date.now() - 1000
        };
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser)
        });
        const controller = setupController(1);
        await controller(req, res);
        expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith("123");
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Verification time ended, signup again.",
            success: false
        });
    });

    test("for user is inactive", async () => {
        const mockUser = {
            isActive: false,
            emailVerified: true
        };
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser)
        });
        const controller = setupController(2); // recover
        await controller(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Your account is blocked, you can't recover it.",
            success: false
        });
    });

    test("for email not verified", async () => {
        const mockUser = {
            isActive: true,
            emailVerified: false
        };
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser)
        });
        const controller = setupController(3); // delete
        await controller(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Email not verified, you can't delete it.",
            success: false
        });
    });

    test("for otp limit exceeded", async () => {
        validEmailRequest.mockReturnValue(false);
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                emailVerified: false,
                destroyDataAfter: Date.now() + 10000
            })
        });
        const controller = setupController(1);
        await controller(req, res);
        expect(validEmailRequest).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(429);
        expect(res.json).toHaveBeenCalledWith({
            message: "OTP request exceed, try again later.",
            success: false
        });
    });

    test("for verification successfully", async () => {
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
        const controller = setupController(1);
        await controller(req, res);
        expect(verificationToken.saveSendToken).toHaveBeenCalled();
        expect(verificationMailSender.sendEmail).toHaveBeenCalled();
        expect(mockUser.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            data: {
                userId: "123",
                fullName: "Test User",
                email: "test@gmail.com"
            },
            message: "Verification OTP sended to your email successfully.",
            success: true
        });
    });

    test("for server error", async () => {
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockRejectedValue(new Error("DB error"))
        });
        const controller = setupController(1);
        await controller(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Oops! Something went wrong while sending link.Try again later.",
            success: false
        });
    });
});