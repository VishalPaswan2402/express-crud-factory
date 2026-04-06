import { beforeEach, describe, expect, jest, test } from "@jest/globals";

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
        return verifySignupEmailController(
            UserModel,
            userSecretConfig,
            isLink
        );
    };
    beforeEach(() => {
        req = {
            params: { userId: "123" },
            query: { token: "test-token" },
            body: { otp: "123456" }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        UserModel = {
            findById: jest.fn(),
            findByIdAndDelete: jest.fn()
        };
        userSecretConfig = {
            jwtSecret: "secret"
        };
        jest.clearAllMocks();
    });

    test("for token missing (link)", async () => {
        req.query = {};
        const controller = setupController(true);
        await controller(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Token is missing",
            success: false
        });
    });

    test("for user not found", async () => {
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(null)
        });
        const controller = setupController(true);
        await controller(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "User not found.",
            success: false
        });
    });

    test("for email already verified", async () => {
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                emailVerified: true
            })
        });
        const controller = setupController(true);
        await controller(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("for delete expired user", async () => {
        const user = {
            _id: "123",
            emailVerified: false,
            destroyDataAfter: Date.now() - 1000
        };
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(user)
        });
        const controller = setupController(true);
        await controller(req, res);
        expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith("123");
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("for token expired", async () => {
        const user = {
            emailVerified: false,
            destroyDataAfter: Date.now() + 10000,
            verifyTokenExpires: Date.now() - 1000
        };
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(user)
        });
        const controller = setupController(true);
        await controller(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("for token invalid", async () => {
        const user = {
            emailVerified: false,
            verifyToken: "wrong-token",
            verifyTokenExpires: Date.now() + 10000,
            destroyDataAfter: Date.now() + 10000
        };
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(user)
        });
        const controller = setupController(true);
        await controller(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Invalid token.",
            success: false
        });
    });

    test("for OTP invalid", async () => {
        emailTokenGenerator.compareOtp.mockResolvedValue(false);
        const user = {
            emailVerified: false,
            verifyToken: "hashed",
            verifyTokenExpires: Date.now() + 10000,
            destroyDataAfter: Date.now() + 10000
        };
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(user)
        });
        const controller = setupController(false);
        await controller(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("for verify email successfully (link)", async () => {
        const user = {
            _id: "123",
            email: "test@gmail.com",
            emailVerified: false,
            verifyToken: "test-token",
            verifyTokenExpires: Date.now() + 10000,
            destroyDataAfter: Date.now() + 10000
        };
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(user)
        });
        userAfterVerification.mockResolvedValue({ id: "123" });
        generateJwtToken.mockReturnValue("jwt");
        const controller = setupController(true);
        await controller(req, res);
        expect(userAfterVerification).toHaveBeenCalled();
        expect(generateJwtToken).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            data: { id: "123" },
            token: "jwt",
            message: "Email verified and account created successfully.",
            success: true
        });
    });

    test("for verify email successfully (OTP)", async () => {
        emailTokenGenerator.compareOtp.mockResolvedValue(true);
        const user = {
            _id: "123",
            email: "test@gmail.com",
            emailVerified: false,
            verifyToken: "hashed",
            verifyTokenExpires: Date.now() + 10000,
            destroyDataAfter: Date.now() + 10000
        };
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(user)
        });
        userAfterVerification.mockResolvedValue({ id: "123" });
        generateJwtToken.mockReturnValue("jwt");
        const controller = setupController(false);
        await controller(req, res);
        expect(emailTokenGenerator.compareOtp).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
    });

    test("for server error", async () => {
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockRejectedValue(new Error("DB error"))
        });
        const controller = setupController(true);
        await controller(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Oops! Something went wrong while verifying email.Try again.",
            success: false
        });
    });
});