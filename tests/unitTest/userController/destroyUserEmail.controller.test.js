import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import destroyUserEmailController from "../../../src/controllers/userControllers/destroyUserEmail.controller";

describe("Destroy User Email Controller Snapshot Test", () => {
    let req, res, UserModel;
    const sanitizeResponse = (res) => {
        const body = { ...res.json.mock.calls[0][0] };
        if (body?.data?.userId) {
            body.data.userId = "mocked-user-id";
        }
        return {
            status: res.status.mock.calls[0][0],
            body
        };
    };
    beforeEach(() => {
        req = {
            query: {
                token: "valid-token"
            },
            params: {
                userId: "123"
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        UserModel = {
            findById: jest.fn(),
            findByIdAndDelete: jest.fn()
        };
    });

    test("for token missing.", async () => {
        req.query.token = "";
        const controller = destroyUserEmailController(UserModel);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for user not found.", async () => {
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(null)
        });
        const controller = destroyUserEmailController(UserModel);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for user inactive.", async () => {
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                isActive: false
            })
        });
        const controller = destroyUserEmailController(UserModel);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for token expired.", async () => {
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                isActive: true,
                verifyToken: "valid-token",
                verifyTokenExpires: Date.now() - 1000
            })
        });
        const controller = destroyUserEmailController(UserModel);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for invalid token.", async () => {
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                isActive: true,
                verifyToken: "different-token",
                verifyTokenExpires: Date.now() + 10000
            })
        });
        const controller = destroyUserEmailController(UserModel);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for successful delete.", async () => {
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                isActive: true,
                verifyToken: "valid-token",
                verifyTokenExpires: Date.now() + 10000
            })
        });
        UserModel.findByIdAndDelete.mockResolvedValue({
            username: "testUser",
            fullname: "Test User",
            email: "test@gmail.com"
        });
        const controller = destroyUserEmailController(UserModel);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith("123");
        expect(result).toMatchSnapshot();
    });

    test("for server error.", async () => {
        UserModel.findById.mockReturnValue({
            select: jest.fn().mockRejectedValue(new Error("DB error"))
        });
        const controller = destroyUserEmailController(UserModel);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });
});