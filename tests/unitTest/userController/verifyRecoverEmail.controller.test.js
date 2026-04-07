import { jest, describe, test, expect, beforeEach, beforeAll } from "@jest/globals";

jest.unstable_mockModule("../../../src/utils/emailTokenGenerator.utils.js", () => ({
    emailTokenGenerator: {
        compareOtp: jest.fn(async () => true)
    }
}));

jest.unstable_mockModule("../../../src/utils/passwordHashing.utils.js", () => ({
    passwordHashing: {
        hashPassword: jest.fn(async () => "hashedPassword"),
        securePassword: jest.fn((pwd) => true)
    }
}));

jest.unstable_mockModule("../../../src/utils/userAfterVerification.utils.js", () => ({
    userAfterVerification: jest.fn(async (user) => ({
        userId: user._id,
        email: user.email,
        fullname: user.fullname
    }))
}));

let verifyRecoverEmailController;
let emailTokenGenerator;
let passwordHashing;

beforeAll(async () => {
    verifyRecoverEmailController = (await import(
        "../../../src/controllers/userControllers/verifyRecoverEmail.controller.js"
    )).default;

    emailTokenGenerator = (await import(
        "../../../src/utils/emailTokenGenerator.utils.js"
    )).emailTokenGenerator;

    passwordHashing = (await import(
        "../../../src/utils/passwordHashing.utils.js"
    )).passwordHashing;
});

describe("Verify Recover Email Controller Snapshot Test", () => {
    let req, res, Model;
    const userSecretConfig = {
        bcryptSecret: "secret"
    };
    const sanitizeResponse = (res) => {
        const body = { ...res.json.mock.calls[0][0] };
        if (body?.data?.userId) body.data.userId = "mocked-user-id";
        return {
            status: res.status.mock.calls[0][0],
            body
        };
    };
    const mockFindById = (data) => ({
        select: jest.fn().mockResolvedValue(data)
    });
    beforeEach(() => {
        req = {
            params: { userId: "user123" },
            query: { token: "valid-token" },
            body: {
                password: "newPass123",
                confirmPassword: "newPass123",
                otp: "123456"
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        Model = {
            findById: jest.fn()
        };
        jest.clearAllMocks();
        passwordHashing.securePassword.mockReturnValue(true);
    });

    test("for missing password fields", async () => {
        req.body.password = "";
        const controller = verifyRecoverEmailController(Model, true, userSecretConfig);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for weak password", async () => {
        req.body.password = "weak";
        req.body.confirmPassword = "weak";
        passwordHashing.securePassword.mockReturnValue(false);
        const controller = verifyRecoverEmailController(Model, true, userSecretConfig);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for password mismatch", async () => {
        req.body.confirmPassword = "wrong";
        const controller = verifyRecoverEmailController(Model, true, userSecretConfig);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for missing token in link mode", async () => {
        req.query.token = "";
        const controller = verifyRecoverEmailController(Model, true, userSecretConfig);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for missing OTP", async () => {
        req.body.otp = "";
        const controller = verifyRecoverEmailController(Model, false, userSecretConfig);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for user not found", async () => {
        Model.findById.mockReturnValue(mockFindById(null));
        const controller = verifyRecoverEmailController(Model, true, userSecretConfig);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for email not verified", async () => {
        Model.findById.mockReturnValue(
            mockFindById({ emailVerified: false })
        );
        const controller = verifyRecoverEmailController(Model, true, userSecretConfig);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for inactive user", async () => {
        Model.findById.mockReturnValue(
            mockFindById({
                emailVerified: true,
                isActive: false
            })
        );
        const controller = verifyRecoverEmailController(Model, true, userSecretConfig);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for expired token", async () => {
        Model.findById.mockReturnValue(
            mockFindById({
                emailVerified: true,
                isActive: true,
                verifyToken: "abc",
                verifyTokenExpires: Date.now() - 1000
            })
        );
        const controller = verifyRecoverEmailController(Model, true, userSecretConfig);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for invalid link token", async () => {
        Model.findById.mockReturnValue(
            mockFindById({
                emailVerified: true,
                isActive: true,
                verifyToken: "correct",
                verifyTokenExpires: Date.now() + 10000
            })
        );
        req.query.token = "wrong";
        const controller = verifyRecoverEmailController(Model, true, userSecretConfig);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for invalid OTP", async () => {
        emailTokenGenerator.compareOtp.mockResolvedValue(false);
        Model.findById.mockReturnValue(
            mockFindById({
                emailVerified: true,
                isActive: true,
                verifyToken: "hashedOtp",
                verifyTokenExpires: Date.now() + 10000
            })
        );
        const controller = verifyRecoverEmailController(Model, false, userSecretConfig);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for successful password update using link", async () => {
        const mockSave = jest.fn();
        const mockUser = {
            _id: "user123",
            email: "test@gmail.com",
            fullname: "Test User",
            emailVerified: true,
            isActive: true,
            verifyToken: "valid-token",
            verifyTokenExpires: Date.now() + 10000,
            save: mockSave
        };
        mockSave.mockResolvedValue(mockUser);
        Model.findById.mockReturnValue(mockFindById(mockUser));
        const controller = verifyRecoverEmailController(Model, true, userSecretConfig);
        await controller(req, res);
        expect(passwordHashing.hashPassword).toHaveBeenCalled();
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for successful password update using OTP", async () => {
        emailTokenGenerator.compareOtp.mockResolvedValue(true);
        const mockSave = jest.fn();
        const mockUser = {
            _id: "user123",
            email: "test@gmail.com",
            fullname: "Test User",
            emailVerified: true,
            isActive: true,
            verifyToken: "hashedOtp",
            verifyTokenExpires: Date.now() + 10000,
            save: mockSave
        };
        mockSave.mockResolvedValue(mockUser);
        Model.findById.mockReturnValue(mockFindById(mockUser));
        const controller = verifyRecoverEmailController(Model, false, userSecretConfig);
        await controller(req, res);
        expect(emailTokenGenerator.compareOtp).toHaveBeenCalled();
        expect(passwordHashing.hashPassword).toHaveBeenCalled();
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for database error", async () => {
        Model.findById.mockReturnValue({
            select: jest.fn().mockRejectedValue(new Error("DB error"))
        });
        const controller = verifyRecoverEmailController(Model, true, userSecretConfig);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });
});