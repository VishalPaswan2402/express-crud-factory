import { jest, describe, test, expect, beforeEach, beforeAll } from "@jest/globals";

jest.unstable_mockModule("../../../src/utils/emailTokenGenerator.utils.js", () => ({
    emailTokenGenerator: {
        compareOtp: jest.fn(),
        emailDecryptToken: jest.fn()
    }
}));

let verifyDestroyEmailController;
let emailTokenGenerator;

beforeAll(async () => {
    verifyDestroyEmailController = (await import(
        "../../../src/controllers/userControllers/verifyDestroyEmail.controller.js"
    )).default;

    emailTokenGenerator = (await import(
        "../../../src/utils/emailTokenGenerator.utils.js"
    )).emailTokenGenerator;
});

describe("Verify Destroy Email Controller Snapshot Test", () => {
    let req, res, Model, emailTokenConfig;
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
            body: { otp: "123456", email: "test@gmail.com", token: "valid-token" },
            loggedUser: { id: "123" }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        Model = {
            findById: jest.fn(),
            findByIdAndDelete: jest.fn(),
            findOne: jest.fn()
        };
        emailTokenConfig = {
            emailTokenSecret: {
                secret: "123456",
                expireIn: "2m"
            }
        };
        emailTokenGenerator.emailDecryptToken.mockReturnValue({
            email: "test@gmail.com",
            verifyType: 3
        });
        jest.clearAllMocks();
    });

    test("for missing token in link mode", async () => {
        req.body.token = "";
        const controller = verifyDestroyEmailController(Model, true, emailTokenConfig);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for missing OTP in OTP mode", async () => {
        req.body.otp = "";
        const controller = verifyDestroyEmailController(Model, false, emailTokenConfig);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for user not found", async () => {
        Model.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue(null)
        });
        const controller = verifyDestroyEmailController(Model, true, emailTokenConfig);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for inactive user", async () => {
        Model.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                isActive: false
            })
        });
        const controller = verifyDestroyEmailController(Model, true, emailTokenConfig);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for expired token", async () => {
        Model.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                isActive: true,
                verifyToken: "abc",
                verifyTokenExpires: Date.now() - 1000
            })
        });
        const controller = verifyDestroyEmailController(Model, true, emailTokenConfig);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for invalid link token", async () => {
        Model.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                _id: { equals: jest.fn(() => true) },
                isActive: true,
                verifyToken: "correct-token",
                verifyTokenExpires: Date.now() + 10000
            })
        });
        req.body.token = "wrong-token";
        const controller = verifyDestroyEmailController(Model, true, emailTokenConfig);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for invalid OTP", async () => {
        emailTokenGenerator.compareOtp.mockResolvedValue(false);
        Model.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                _id: { equals: jest.fn(() => true) },
                isActive: true,
                verifyToken: "hashedOtp",
                verifyTokenExpires: Date.now() + 10000
            })
        });
        const controller = verifyDestroyEmailController(Model, false, emailTokenConfig);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for successful delete using link", async () => {
        const user = {
            _id: "123",
            isActive: true,
            verifyToken: "valid-token",
            verifyTokenExpires: Date.now() + 10000
        };
        Model.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue(user)
        });
        Model.findByIdAndDelete.mockResolvedValue({
            username: "test",
            fullname: "Test User",
            email: "test@gmail.com"
        });
        const controller = verifyDestroyEmailController(Model, true, emailTokenConfig);
        await controller(req, res);
        expect(Model.findByIdAndDelete).toHaveBeenCalledWith("123");
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for successful delete using OTP", async () => {
        emailTokenGenerator.compareOtp.mockResolvedValue(true);
        const user = {
            _id: { equals: jest.fn(() => true), toString: () => "123" },
            isActive: true,
            verifyToken: "hashedOtp",
            verifyTokenExpires: Date.now() + 10000
        };
        Model.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue(user)
        });
        Model.findByIdAndDelete.mockResolvedValue({
            username: "test",
            fullname: "Test User",
            email: "test@gmail.com"
        });
        const controller = verifyDestroyEmailController(Model, false, emailTokenConfig);
        await controller(req, res);
        expect(emailTokenGenerator.compareOtp).toHaveBeenCalled();
        expect(Model.findByIdAndDelete).toHaveBeenCalled();
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for database error", async () => {
        Model.findOne.mockReturnValue({
            select: jest.fn().mockRejectedValue(new Error("DB error"))
        });
        const controller = verifyDestroyEmailController(Model, true, emailTokenConfig);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });
});