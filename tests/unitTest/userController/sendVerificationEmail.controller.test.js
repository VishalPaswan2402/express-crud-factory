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
    let req, res, UserModel, emailTokenConfig;
    const setupController = (create = 1, verifyMethodOverride = {}) => {
        const userSecretConfig = {};
        const emailSender = {};
        const verifyMethod = {
            usingLink: false,
            otpLinkExpiryMinutes: 10,
            ...verifyMethodOverride
        };
        emailTokenConfig = {
            emailTokenSecret: {
                secret: "123",
                expireIn: "2m"
            }
        };
        return sendVerificationEmailController(
            UserModel,
            userSecretConfig,
            emailSender,
            verifyMethod,
            create,
            emailTokenConfig
        );
    };
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
            body: { email: "test@gmail.com" },
            loggedUser: { id: "123" }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        UserModel = {
            findById: jest.fn(),
            findByIdAndDelete: jest.fn(),
            findOne: jest.fn()
        };
        jest.clearAllMocks();
    });

    test("for user not found", async () => {
        UserModel.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue(null)
        });
        const controller = setupController(1);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for email already verified", async () => {
        UserModel.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                emailVerified: true
            })
        });
        const controller = setupController(1);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for destroyDataAfter expired", async () => {
        const mockUser = {
            _id: "123",
            emailVerified: false,
            destroyDataAfter: Date.now() - 1000
        };
        UserModel.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser)
        });
        const controller = setupController(1);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for user is inactive", async () => {
        const mockUser = {
            isActive: false,
            emailVerified: true
        };
        UserModel.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser)
        });
        const controller = setupController(2); // recover
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for email not verified", async () => {
        const mockUser = {
            isActive: true,
            emailVerified: false
        };
        UserModel.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser)
        });
        const controller = setupController(3); // delete
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for otp limit exceeded", async () => {
        validEmailRequest.mockReturnValue(false);
        UserModel.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                emailVerified: false,
                destroyDataAfter: Date.now() + 10000
            })
        });
        const controller = setupController(1);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
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
        UserModel.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser)
        });
        verificationToken.saveSendToken.mockResolvedValue({
            saveToken: "hashedToken",
            sendToken: "123456"
        });
        dataExpiryTime.otpLinkExpire.mockReturnValue("futureTime");
        const controller = setupController(1);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for server error", async () => {
        UserModel.findOne.mockReturnValue({
            select: jest.fn().mockRejectedValue(new Error("DB error"))
        });
        const controller = setupController(1);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });
});