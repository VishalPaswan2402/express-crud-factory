import { beforeEach, describe, expect, jest, test, afterEach } from "@jest/globals";
await jest.unstable_mockModule("../../../src/utils/generateJwtToken.utils.js", () => ({
    generateJwtToken: jest.fn()
}));
await jest.unstable_mockModule("../../../src/utils/emailTokenGenerator.utils.js", () => ({
    emailTokenGenerator: {
        compareOtp: jest.fn()
    }
}));
const { generateJwtToken } = await import("../../../src/utils/generateJwtToken.utils.js");
const { emailTokenGenerator } = await import("../../../src/utils/emailTokenGenerator.utils.js");
const { default: verifySignupOtp } = await import("../../../src/controllers/userControllers/verifySignupOtp.controller.js");

describe("Verify Signup OTP Controller Snapshot Test", () => {
    let req;
    let res;
    let Model;
    let userSecretConfig;
    const mockFindById = (data) => ({
        select: jest.fn().mockResolvedValue(data)
    });
    const sanitizeResponse = (res) => {
        const body = { ...res.json.mock.calls[0][0] };
        if (body?.token) {
            body.token = "mocked-jwt-token";
        }
        return {
            status: res.status.mock.calls[0][0],
            body
        };
    };
    beforeEach(() => {
        req = {
            params: { userId: "123" },
            body: { otp: "1234" }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        Model = {
            findById: jest.fn(),
            findByIdAndDelete: jest.fn()
        };
        userSecretConfig = {
            jwtSecret: {
                secret: "test-secret",
                expireIn: "7d"
            }
        };
        generateJwtToken.mockReset();
        emailTokenGenerator.compareOtp.mockReset();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("otp missing", async () => {
        req.body = {};
        const controller = verifySignupOtp(Model, userSecretConfig);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("invalid user", async () => {
        Model.findById.mockReturnValue(mockFindById(null));
        const controller = verifySignupOtp(Model, userSecretConfig);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("already verified", async () => {
        const user = {
            emailVerified: true
        };
        Model.findById.mockReturnValue(mockFindById(user));
        const controller = verifySignupOtp(Model, userSecretConfig);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("delete expired user", async () => {
        const user = {
            _id: "123",
            emailVerified: false,
            destroyDataAfter: Date.now() - 1000
        };
        Model.findById.mockReturnValue(mockFindById(user));
        Model.findByIdAndDelete.mockResolvedValue(true);
        const controller = verifySignupOtp(Model, userSecretConfig);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(Model.findByIdAndDelete).toHaveBeenCalledWith("123");
        expect(result).toMatchSnapshot();
    });

    test("otp expired", async () => {
        const user = {
            emailVerified: false,
            destroyDataAfter: Date.now() + 10000,
            verifyToken: "hashedOtp",
            verifyTokenExpires: Date.now() - 1000
        };
        Model.findById.mockReturnValue(mockFindById(user));
        const controller = verifySignupOtp(Model, userSecretConfig);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("invalid otp", async () => {
        const user = {
            emailVerified: false,
            destroyDataAfter: Date.now() + 10000,
            verifyToken: "hashedOtp",
            verifyTokenExpires: Date.now() + 10000
        };
        Model.findById.mockReturnValue(mockFindById(user));
        emailTokenGenerator.compareOtp.mockResolvedValue(false);
        const controller = verifySignupOtp(Model, userSecretConfig);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(emailTokenGenerator.compareOtp).toHaveBeenCalled();
        expect(result).toMatchSnapshot();
    });

    test("successful otp verification", async () => {
        const mockSave = jest.fn().mockResolvedValue({
            _id: "123",
            email: "test@gmail.com",
            username: "test",
            emailVerified: true,
            isActive: true,
            toObject() {
                return { ...this };
            }
        });
        const user = {
            _id: "123",
            email: "test@gmail.com",
            username: "test",
            emailVerified: false,
            isActive: false,
            verifyToken: "hashedOtp",
            verifyTokenExpires: Date.now() + 10000,
            destroyDataAfter: Date.now() + 10000,
            save: mockSave
        };
        Model.findById.mockReturnValue(mockFindById(user));
        emailTokenGenerator.compareOtp.mockResolvedValue(true);
        generateJwtToken.mockReturnValue("fake-jwt-token");
        const controller = verifySignupOtp(Model, userSecretConfig);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(emailTokenGenerator.compareOtp).toHaveBeenCalled();
        expect(generateJwtToken).toHaveBeenCalled();
        expect(mockSave).toHaveBeenCalled();
        expect(result).toMatchSnapshot();
    });

    test("internal server error", async () => {
        Model.findById.mockReturnValue({
            select: jest.fn().mockRejectedValue(new Error("DB error"))
        });
        const controller = verifySignupOtp(Model, userSecretConfig);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

});