import { beforeAll, beforeEach, describe, expect, jest, test } from "@jest/globals";

jest.unstable_mockModule("../../../src/utils/generateJwtToken.utils.js", () => ({
    generateJwtToken: jest.fn()
}));

jest.unstable_mockModule("../../../src/utils/emailTokenGenerator.utils.js", () => ({
    emailTokenGenerator: {
        compareOtp: jest.fn()
    }
}));

jest.unstable_mockModule("../../../src/utils/userAfterVerification.utils.js", () => ({
    userAfterVerification: jest.fn()
}));

let verifySignupEmailController;
let generateJwtToken, emailTokenGenerator, userAfterVerification;

beforeAll(async () => {
    generateJwtToken = (await import("../../../src/utils/generateJwtToken.utils.js")).generateJwtToken;
    emailTokenGenerator = (await import("../../../src/utils/emailTokenGenerator.utils.js")).emailTokenGenerator;
    userAfterVerification = (await import("../../../src/utils/userAfterVerification.utils.js")).userAfterVerification;
    verifySignupEmailController = (await import(
        "../../../src/controllers/userControllers/verifySignupEmail.controller.js"
    )).default;
});

describe("Verify Signup Email Controller Snapshot Test", () => {
    let req, res, UserModel, userSecretConfig;
    const setupController = (isLink = true) => {
        return verifySignupEmailController(UserModel, userSecretConfig, isLink);
    };
    const sanitizeResponse = (res) => {
        const body = { ...res.json.mock.calls[0][0] };
        return {
            status: res.status.mock.calls[0][0],
            body
        };
    };
    const mockSelect = (data) => ({
        select: jest.fn().mockResolvedValue(data)
    });
    beforeEach(() => {
        req = {
            body: { otp: "123456", email: "test@gmail.com", token: "test-token" }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        UserModel = {
            findByIdAndDelete: jest.fn(),
            findOne: jest.fn()
        };
        userSecretConfig = {
            jwtSecret: "secret"
        };
        jest.clearAllMocks();
    });

    test("for token missing (link)", async () => {
        req.body.token = "";
        const controller = setupController(true);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for missing OTP/email", async () => {
        req.body.otp = "";
        const controller = setupController(false);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for user not found", async () => {
        UserModel.findOne.mockReturnValue(mockSelect(null));
        const controller = setupController(true);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for email already verified", async () => {
        UserModel.findOne.mockReturnValue(mockSelect({
            emailVerified: true
        }));
        const controller = setupController(true);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for delete expired user", async () => {
        const user = {
            _id: "123",
            emailVerified: false,
            destroyDataAfter: Date.now() - 1000,
            verifyToken: "token",
            verifyTokenType: "create_token"
        };
        UserModel.findOne.mockReturnValue(mockSelect(user));
        const controller = setupController(true);
        await controller(req, res);
        expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith("123");
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for token expired", async () => {
        const user = {
            emailVerified: false,
            verifyToken: "token",
            verifyTokenExpires: Date.now() - 1000,
            destroyDataAfter: Date.now() + 10000,
            verifyTokenType: "create_token"
        };
        UserModel.findOne.mockReturnValue(mockSelect(user));
        const controller = setupController(true);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for token type invalid", async () => {
        const user = {
            emailVerified: false,
            verifyToken: "token",
            verifyTokenExpires: Date.now() + 10000,
            destroyDataAfter: Date.now() + 10000,
            verifyTokenType: "wrong_type"
        };
        UserModel.findOne.mockReturnValue(mockSelect(user));
        const controller = setupController(true);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for OTP invalid", async () => {
        emailTokenGenerator.compareOtp.mockResolvedValue(false);
        const user = {
            emailVerified: false,
            verifyToken: "hashed",
            verifyTokenExpires: Date.now() + 10000,
            destroyDataAfter: Date.now() + 10000,
            verifyTokenType: "create_token"
        };
        UserModel.findOne.mockReturnValue(mockSelect(user));
        const controller = setupController(false);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for verify email successfully (link)", async () => {
        const user = {
            _id: "123",
            email: "test@gmail.com",
            emailVerified: false,
            verifyToken: "test-token",
            verifyTokenType: "create_token",
            verifyTokenExpires: Date.now() + 10000,
            destroyDataAfter: Date.now() + 10000
        };
        UserModel.findOne.mockReturnValue(mockSelect(user));
        userAfterVerification.mockResolvedValue({ id: "123" });
        const controller = setupController(true);
        await controller(req, res);
        expect(userAfterVerification).toHaveBeenCalled();
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for verify email successfully (OTP)", async () => {
        emailTokenGenerator.compareOtp.mockResolvedValue(true);
        const user = {
            _id: "123",
            email: "test@gmail.com",
            emailVerified: false,
            verifyToken: "hashed",
            verifyTokenType: "create_token",
            verifyTokenExpires: Date.now() + 10000,
            destroyDataAfter: Date.now() + 10000
        };
        UserModel.findOne.mockReturnValue(mockSelect(user));
        userAfterVerification.mockResolvedValue({ id: "123" });
        generateJwtToken.mockReturnValue("jwt");
        const controller = setupController(false);
        await controller(req, res);
        expect(generateJwtToken).toHaveBeenCalled();
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for server error", async () => {
        UserModel.findOne.mockReturnValue({
            select: jest.fn().mockRejectedValue(new Error("DB error"))
        });
        const controller = setupController(true);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });
});