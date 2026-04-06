import { jest, describe, test, expect, beforeEach, beforeAll } from "@jest/globals";

jest.unstable_mockModule("../../../src/utils/emailTokenGenerator.utils.js", () => ({
    emailTokenGenerator: {
        compareOtp: jest.fn(async () => true)
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
    let req, res, Model;
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
            body: { otp: "123456" }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        Model = {
            findById: jest.fn(),
            findByIdAndDelete: jest.fn()
        };
        jest.clearAllMocks();
    });

    test("for missing token in link mode", async () => {
        req.query.token = "";
        const controller = verifyDestroyEmailController(Model, true);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for missing OTP in OTP mode", async () => {
        req.body.otp = "";
        const controller = verifyDestroyEmailController(Model, false);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for user not found", async () => {
        Model.findById.mockReturnValue(mockFindById(null));
        const controller = verifyDestroyEmailController(Model, true);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for inactive user", async () => {
        Model.findById.mockReturnValue(
            mockFindById({
                isActive: false
            })
        );
        const controller = verifyDestroyEmailController(Model, true);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for expired token", async () => {
        Model.findById.mockReturnValue(
            mockFindById({
                isActive: true,
                verifyToken: "abc",
                verifyTokenExpires: Date.now() - 1000
            })
        );
        const controller = verifyDestroyEmailController(Model, true);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for invalid link token", async () => {
        Model.findById.mockReturnValue(
            mockFindById({
                isActive: true,
                verifyToken: "correct-token",
                verifyTokenExpires: Date.now() + 10000
            })
        );
        req.query.token = "wrong-token";
        const controller = verifyDestroyEmailController(Model, true);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for invalid OTP", async () => {
        emailTokenGenerator.compareOtp.mockResolvedValue(false);
        Model.findById.mockReturnValue(
            mockFindById({
                isActive: true,
                verifyToken: "hashedOtp",
                verifyTokenExpires: Date.now() + 10000
            })
        );
        const controller = verifyDestroyEmailController(Model, false);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for successful delete using link", async () => {
        Model.findById.mockReturnValue(
            mockFindById({
                isActive: true,
                verifyToken: "valid-token",
                verifyTokenExpires: Date.now() + 10000
            })
        );
        Model.findByIdAndDelete.mockResolvedValue({
            username: "test",
            fullname: "Test User",
            email: "test@gmail.com"
        });
        const controller = verifyDestroyEmailController(Model, true);
        await controller(req, res);
        expect(Model.findByIdAndDelete).toHaveBeenCalledWith("user123");
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for successful delete using OTP", async () => {
        emailTokenGenerator.compareOtp.mockResolvedValue(true);
        Model.findById.mockReturnValue(
            mockFindById({
                isActive: true,
                verifyToken: "hashedOtp",
                verifyTokenExpires: Date.now() + 10000
            })
        );
        Model.findByIdAndDelete.mockResolvedValue({
            username: "test",
            fullname: "Test User",
            email: "test@gmail.com"
        });
        const controller = verifyDestroyEmailController(Model, false);
        await controller(req, res);
        expect(emailTokenGenerator.compareOtp).toHaveBeenCalled();
        expect(Model.findByIdAndDelete).toHaveBeenCalled();
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for database error", async () => {
        Model.findById.mockReturnValue({
            select: jest.fn().mockRejectedValue(new Error("DB error"))
        });
        const controller = verifyDestroyEmailController(Model, true);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });
});