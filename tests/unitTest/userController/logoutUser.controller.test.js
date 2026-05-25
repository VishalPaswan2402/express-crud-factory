import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const mockErrorResponse = jest.fn();

await jest.unstable_mockModule("../../../src/utils/response.utils.js", () => ({
    errorResponse: mockErrorResponse
}));

const {
    default: logoutUserController
} = await import("../../../src/controllers/userControllers/logoutUser.controller.js");

describe("Logout User Controller Snapshot Test", () => {
    let UserModel;
    let ExpiredTokensModel;
    let req;
    let res;
    const mockSelect = (value) => ({
        select: jest.fn().mockResolvedValue(value)
    });
    const sanitizeResponse = (res) => ({
        status: res.status.mock.calls[0]?.[0],
        body: res.json.mock.calls[0]?.[0]
    });
    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            params: {
                userId: "123"
            },
            incomingAccessToken: {
                token: "accessToken",
                expiryTime: "2026-12-31"
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            clearCookie: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        UserModel = {
            findById: jest.fn()
        };
        ExpiredTokensModel = jest.fn().mockImplementation((data) => ({
            ...data,
            save: jest.fn().mockResolvedValue(true)
        }));
        mockErrorResponse.mockImplementation((res, status, message) => {
            return res.status(status).json({
                success: false,
                message
            });
        });
    });

    test("for user not found", async () => {
        UserModel.findById.mockReturnValue(mockSelect(null));
        const controller = logoutUserController(
            UserModel,
            ExpiredTokensModel
        );
        await controller(req, res);
        expect(UserModel.findById).toHaveBeenCalled();
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("success logout", async () => {
        const user = {
            _id: "123",
            jwtRefreshToken: "refreshToken",
            save: jest.fn().mockResolvedValue(true)
        };
        UserModel.findById.mockReturnValue(mockSelect(user));
        const controller = logoutUserController(
            UserModel,
            ExpiredTokensModel
        );
        await controller(req, res);
        expect(user.jwtRefreshToken).toBeNull();
        expect(user.save).toHaveBeenCalled();
        expect(ExpiredTokensModel).toHaveBeenCalledWith({
            accessToken: "accessToken",
            expireTime: "2026-12-31"
        });
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("expired token save error", async () => {
        const user = {
            _id: "123",
            jwtRefreshToken: "refreshToken",
            save: jest.fn().mockResolvedValue(true)
        };
        UserModel.findById.mockReturnValue(mockSelect(user));
        ExpiredTokensModel = jest.fn().mockImplementation(() => ({
            save: jest.fn().mockRejectedValue(new Error("DB Error"))
        }));
        const controller = logoutUserController(
            UserModel,
            ExpiredTokensModel
        );
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("user save error", async () => {
        const user = {
            _id: "123",
            jwtRefreshToken: "refreshToken",
            save: jest.fn().mockRejectedValue(new Error("DB Error"))
        };
        UserModel.findById.mockReturnValue(mockSelect(user));
        const controller = logoutUserController(
            UserModel,
            ExpiredTokensModel
        );
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("database find error", async () => {
        UserModel.findById.mockImplementation(() => {
            throw new Error("DB Error");
        });
        const controller = logoutUserController(
            UserModel,
            ExpiredTokensModel
        );
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

});