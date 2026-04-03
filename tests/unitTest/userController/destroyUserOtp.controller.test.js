import { jest, describe, test, expect, beforeEach, beforeAll } from "@jest/globals";

jest.unstable_mockModule("../../../src/utils/emailTokenGenerator.utils.js", () => ({
    emailTokenGenerator: {
        compareOtp: jest.fn()
    }
}));

let destroyUserOtpController;
let emailTokenGenerator;

beforeAll(async () => {
    const utils = await import("../../../src/utils/emailTokenGenerator.utils.js");
    emailTokenGenerator = utils.emailTokenGenerator;

    const controllerModule = await import(
        "../../../src/controllers/userControllers/destroyUserOtp.controller.js"
    );
    destroyUserOtpController = controllerModule.default;
});

describe("Destroy User OTP Controller Snapshot Test", () => {
    let req, res, UserModel;
    const sanitizeResponse = (res) => {
        const body = res.json.mock.calls[0][0];
        return {
            status: res.status.mock.calls[0][0],
            body
        };
    };
    beforeEach(() => {
        req = {
            params: { userId: "123" },
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
        jest.clearAllMocks();
    });

    test("for otp missing.", async () => {
        req.body.otp = "";
        const controller = destroyUserOtpController(UserModel);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for user not found.", async () => {
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(null)
        });
        const controller = destroyUserOtpController(UserModel);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for inactive user.", async () => {
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                isActive: false
            })
        });
        const controller = destroyUserOtpController(UserModel);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for expired otp.", async () => {
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                isActive: true,
                verifyToken: "hashedOtp",
                verifyTokenExpires: Date.now() - 1000
            })
        });
        const controller = destroyUserOtpController(UserModel);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for invalid otp.", async () => {
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                isActive: true,
                verifyToken: "hashedOtp",
                verifyTokenExpires: Date.now() + 10000
            })
        });
        emailTokenGenerator.compareOtp.mockResolvedValue(false);
        const controller = destroyUserOtpController(UserModel);
        await controller(req, res);
        expect(emailTokenGenerator.compareOtp).toHaveBeenCalled(); // ✅ FIXED
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for successful delete.", async () => {
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                isActive: true,
                verifyToken: "hashedOtp",
                verifyTokenExpires: Date.now() + 10000
            })
        });
        emailTokenGenerator.compareOtp.mockResolvedValue(true);
        UserModel.findByIdAndDelete.mockResolvedValue({
            username: "testUser",
            email: "test@gmail.com"
        });
        const controller = destroyUserOtpController(UserModel);
        await controller(req, res);
        expect(emailTokenGenerator.compareOtp)
            .toHaveBeenCalledWith("123456", "hashedOtp");
        expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith("123");
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for server error.", async () => {
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockRejectedValue(new Error("DB error"))
        });
        const controller = destroyUserOtpController(UserModel);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });
});