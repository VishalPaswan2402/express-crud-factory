import { jest, describe, test, expect, beforeEach, beforeAll } from "@jest/globals";

jest.unstable_mockModule("../../../src/utils/emailTokenGenerator.utils.js", () => ({
    emailTokenGenerator: {
        compareOtp: jest.fn()
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
    let req, res, UserModel, PostModel;
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
            body: {
                otp: "123456",
                email: "test@gmail.com",
                token: "valid-token"
            },
            loggedUser: { id: "123" }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        UserModel = {
            findByIdAndDelete: jest.fn(),
            findOne: jest.fn()
        };
        PostModel = {
            deleteMany: jest.fn()
        };
        jest.clearAllMocks();
    });

    test("for missing token in link mode", async () => {
        req.body.token = "";
        const controller = verifyDestroyEmailController(UserModel, PostModel, true);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for missing OTP in OTP mode", async () => {
        req.body.otp = "";
        const controller = verifyDestroyEmailController(UserModel, PostModel, false);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for user not found", async () => {
        UserModel.findOne.mockReturnValue(mockSelect(null));
        const controller = verifyDestroyEmailController(UserModel, PostModel, true);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for user mismatch in OTP mode", async () => {
        UserModel.findOne.mockReturnValue(mockSelect({
            _id: { equals: jest.fn(() => false) },
            isActive: true
        }));
        const controller = verifyDestroyEmailController(UserModel, PostModel, false);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for inactive user", async () => {
        UserModel.findOne.mockReturnValue(mockSelect({
            isActive: false
        }));
        const controller = verifyDestroyEmailController(UserModel, PostModel, true);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for expired token", async () => {
        UserModel.findOne.mockReturnValue(mockSelect({
            isActive: true,
            verifyToken: "abc",
            verifyTokenExpires: Date.now() - 1000,
            verifyTokenType: "destroy_token"
        }));
        const controller = verifyDestroyEmailController(UserModel, PostModel, true);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for invalid token type", async () => {
        UserModel.findOne.mockReturnValue(mockSelect({
            isActive: true,
            verifyToken: "abc",
            verifyTokenExpires: Date.now() + 10000,
            verifyTokenType: "wrong_type"
        }));
        const controller = verifyDestroyEmailController(UserModel, PostModel, true);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for invalid OTP", async () => {
        emailTokenGenerator.compareOtp.mockResolvedValue(false);
        UserModel.findOne.mockReturnValue(mockSelect({
            _id: { equals: jest.fn(() => true) },
            isActive: true,
            verifyToken: "hashedOtp",
            verifyTokenExpires: Date.now() + 10000,
            verifyTokenType: "destroy_token"
        }));
        const controller = verifyDestroyEmailController(UserModel, PostModel, false);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for successful delete using link", async () => {
        const user = {
            _id: "123",
            isActive: true,
            verifyToken: "valid-token",
            verifyTokenExpires: Date.now() + 10000,
            verifyTokenType: "destroy_token"
        };
        UserModel.findOne.mockReturnValue(mockSelect(user));
        UserModel.findByIdAndDelete.mockResolvedValue({
            username: "test",
            fullname: "Test User",
            email: "test@gmail.com"
        });
        const controller = verifyDestroyEmailController(UserModel, PostModel, true);
        await controller(req, res);
        expect(PostModel.deleteMany).toHaveBeenCalledWith({ author: user._id });
        expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith("123");
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for successful delete using OTP", async () => {
        emailTokenGenerator.compareOtp.mockResolvedValue(true);
        const user = {
            _id: { equals: jest.fn(() => true) },
            isActive: true,
            verifyToken: "hashedOtp",
            verifyTokenExpires: Date.now() + 10000,
            verifyTokenType: "destroy_token"
        };
        UserModel.findOne.mockReturnValue(mockSelect(user));
        UserModel.findByIdAndDelete.mockResolvedValue({
            username: "test",
            fullname: "Test User",
            email: "test@gmail.com"
        });
        const controller = verifyDestroyEmailController(UserModel, PostModel, false);
        await controller(req, res);
        expect(emailTokenGenerator.compareOtp).toHaveBeenCalled();
        expect(PostModel.deleteMany).toHaveBeenCalledWith({ author: user._id });
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for database error", async () => {
        UserModel.findOne.mockReturnValue({
            select: jest.fn().mockRejectedValue(new Error("DB error"))
        });
        const controller = verifyDestroyEmailController(UserModel, PostModel, true);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });
});