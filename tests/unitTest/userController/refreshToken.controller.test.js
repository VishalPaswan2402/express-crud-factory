import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const mockVerify = jest.fn();
const mockErrorResponse = jest.fn();
const mockLoginResponse = jest.fn();
const mockGenerateJwtAccessToken = jest.fn();
const mockGenerateJwtRefreshToken = jest.fn();

await jest.unstable_mockModule("jsonwebtoken", () => ({
    default: {
        verify: mockVerify
    }
}));

await jest.unstable_mockModule("../../../src/utils/response.utils.js", () => ({
    errorResponse: mockErrorResponse,
    loginResponse: mockLoginResponse,
    successResponse: jest.fn()
}));

await jest.unstable_mockModule("../../../src/utils/generateJwtToken.utils.js", () => ({
    generateJwtAccessToken: mockGenerateJwtAccessToken,
    generateJwtRefreshToken: mockGenerateJwtRefreshToken
}));

const {
    default: refreshTokenController
} = await import("../../../src/controllers/userControllers/refreshToken.controller.js");

describe("Refresh Token Controller Snapshot Test", () => {
    let UserModel;
    let req;
    let res;
    let userSecretConfig;
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
            cookies: {},
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            cookie: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        UserModel = {
            findById: jest.fn()
        };
        userSecretConfig = {
            jwtSecret: {
                refreshKey: "refreshSecret",
                accessKey: "accessSecret"
            }
        };
        mockErrorResponse.mockImplementation((res, status, message) => {
            return res.status(status).json({
                success: false,
                message
            });
        });
        mockLoginResponse.mockImplementation(
            (res, status, data, accessToken, refreshToken, message) => {
                return res
                    .status(status)
                    .cookie("accessToken", accessToken, {})
                    .cookie("refreshToken", refreshToken, {})
                    .json({
                        success: true,
                        data,
                        accessToken,
                        refreshToken,
                        message
                    });
            }
        );
    });

    test("for missing refresh token", async () => {
        const controller = refreshTokenController(UserModel, userSecretConfig);
        await controller(req, res);
        expect(mockErrorResponse).toHaveBeenCalled();
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for unauthorized user", async () => {
        req.body.refreshToken = "token";
        mockVerify.mockReturnValue({ id: "456" });
        const controller = refreshTokenController(UserModel, userSecretConfig);
        await controller(req, res);
        expect(mockVerify).toHaveBeenCalled();
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for user not found", async () => {
        req.body.refreshToken = "token";
        mockVerify.mockReturnValue({ id: "123" });
        UserModel.findById.mockReturnValue(mockSelect(null));
        const controller = refreshTokenController(UserModel, userSecretConfig);
        await controller(req, res);
        expect(UserModel.findById).toHaveBeenCalled();
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for invalid refresh token", async () => {
        req.body.refreshToken = "token";
        mockVerify.mockReturnValue({ id: "123" });
        const user = {
            _id: "123",
            jwtRefreshToken: "wrongToken"
        };
        UserModel.findById.mockReturnValue(mockSelect(user));
        const controller = refreshTokenController(UserModel, userSecretConfig);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("success - body token", async () => {
        req.body.refreshToken = "token";
        mockVerify.mockReturnValue({ id: "123" });
        const user = {
            _id: "123",
            jwtRefreshToken: "token",
            save: jest.fn().mockResolvedValue(true)
        };
        UserModel.findById.mockReturnValue(mockSelect(user));
        mockGenerateJwtAccessToken.mockReturnValue("accessToken");
        mockGenerateJwtRefreshToken.mockReturnValue("refreshToken");
        const controller = refreshTokenController(UserModel, userSecretConfig);
        await controller(req, res);
        expect(mockGenerateJwtAccessToken).toHaveBeenCalled();
        expect(mockGenerateJwtRefreshToken).toHaveBeenCalled();
        expect(user.save).toHaveBeenCalled();
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("success - cookie token", async () => {
        req.cookies.refreshToken = "token";
        mockVerify.mockReturnValue({ id: "123" });
        const user = {
            _id: "123",
            jwtRefreshToken: "token",
            save: jest.fn().mockResolvedValue(true)
        };
        UserModel.findById.mockReturnValue(mockSelect(user));
        mockGenerateJwtAccessToken.mockReturnValue("accessToken");
        mockGenerateJwtRefreshToken.mockReturnValue("refreshToken");
        const controller = refreshTokenController(UserModel, userSecretConfig);
        await controller(req, res);
        expect(mockLoginResponse).toHaveBeenCalled();
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("jwt verify error", async () => {
        req.body.refreshToken = "token";
        mockVerify.mockImplementation(() => {
            throw new Error("jwt error");
        });
        const controller = refreshTokenController(UserModel, userSecretConfig);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("db save error", async () => {
        req.body.refreshToken = "token";
        mockVerify.mockReturnValue({ id: "123" });
        const user = {
            _id: "123",
            jwtRefreshToken: "token",
            save: jest.fn().mockRejectedValue(new Error("db error"))
        };
        UserModel.findById.mockReturnValue(mockSelect(user));
        mockGenerateJwtAccessToken.mockReturnValue("accessToken");
        mockGenerateJwtRefreshToken.mockReturnValue("refreshToken");
        const controller = refreshTokenController(UserModel, userSecretConfig);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });
});