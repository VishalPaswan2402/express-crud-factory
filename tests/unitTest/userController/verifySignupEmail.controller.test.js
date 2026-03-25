import { beforeEach, describe, expect, jest, test, afterEach } from "@jest/globals";
await jest.unstable_mockModule("../../../src/utils/generateJwtToken.utils.js", () => ({
    generateJwtToken: jest.fn()
}));
const { generateJwtToken } = await import("../../../src/utils/generateJwtToken.utils.js");
const { default: verifySignupEmail } = await import("../../../src/controllers/userControllers/verifySignupEmail.controller.js");

describe("Verify Signup Email Controller Snapshot Test", () => {
    let req;
    let res;
    let Model;
    let userSecretConfig;
    const mockFindOne = (data) => ({
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
            query: {
                token: "test-token"
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        Model = {
            findOne: jest.fn(),
            findByIdAndDelete: jest.fn()
        };
        userSecretConfig = {
            jwtSecret: {
                secret: "test-secret",
                expireIn: "7d"
            }
        };
        generateJwtToken.mockReset();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("for token missing", async () => {
        req.query = {};
        const controller = verifySignupEmail(Model, userSecretConfig);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("for invalid token", async () => {
        Model.findOne.mockReturnValue(mockFindOne(null));
        const controller = verifySignupEmail(Model, userSecretConfig);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("for email already verified", async () => {
        const user = {
            emailVerified: true
        };
        Model.findOne.mockReturnValue(mockFindOne(user));
        const controller = verifySignupEmail(Model, userSecretConfig);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("for delete expired user and ask signup again", async () => {
        const user = {
            _id: "123",
            emailVerified: false,
            destroyDataAfter: Date.now() - 1000
        };
        Model.findOne.mockReturnValue(mockFindOne(user));
        Model.findByIdAndDelete.mockResolvedValue(true);
        const controller = verifySignupEmail(Model, userSecretConfig);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(Model.findByIdAndDelete).toHaveBeenCalledWith("123");
        expect(result).toMatchSnapshot();
    });

    test("for token expired", async () => {
        const user = {
            emailVerified: false,
            destroyDataAfter: Date.now() + 10000,
            verifyTokenExpires: Date.now() - 1000
        };
        Model.findOne.mockReturnValue(mockFindOne(user));
        const controller = verifySignupEmail(Model, userSecretConfig);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("for successful email verification", async () => {
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
            verifyToken: "test-token",
            verifyTokenExpires: Date.now() + 10000,
            destroyDataAfter: Date.now() + 10000,
            save: mockSave
        };
        Model.findOne.mockReturnValue(mockFindOne(user));
        generateJwtToken.mockReturnValue("fake-jwt-token");
        const controller = verifySignupEmail(Model, userSecretConfig);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(mockSave).toHaveBeenCalled();
        expect(generateJwtToken).toHaveBeenCalled();
        expect(result).toMatchSnapshot();
    });

    test("for internal server error", async () => {
        Model.findOne.mockReturnValue({
            select: jest.fn().mockRejectedValue(new Error("DB error"))
        });
        const controller = verifySignupEmail(Model, userSecretConfig);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

});