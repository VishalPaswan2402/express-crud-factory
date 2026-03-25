import { beforeEach, describe, expect, jest, test, afterEach } from '@jest/globals';
import jsonValidate from '../../../src/middlewares/jsonValidate.middleware';
import loginUserController from '../../../src/controllers/userControllers/loginUser.controller';
import { passwordHashing } from '../../../src/utils/passwordHashing.utils';

await jest.unstable_mockModule("../../../src/utils/generateJwtToken.utils.js", () => ({
    generateJwtToken: jest.fn()
}));

const { generateJwtToken } = await import("../../../src/utils/generateJwtToken.utils.js");

describe("Login User Controller Snapshot Test", () => {
    let req;
    let res;
    let Model;
    let next;
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
            body: {
                username: "test",
                password: "testPassword"
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        Model = {
            findOne: jest.fn(),
            findByIdAndDelete: jest.fn()
        };
        next = jest.fn();
        userSecretConfig = {
            jwtSecret: {
                secret: "test-secret",
                expireIn: "7d"
            }
        };
        generateJwtToken.mockReset();
        jest.spyOn(passwordHashing, "comparePassword").mockReset();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("for empty request body.", () => {
        req.body = {};
        jsonValidate(req, res, next);
        const result = sanitizeResponse(res);
        expect(next).not.toHaveBeenCalled();
        expect(result).toMatchSnapshot();
    });

    test("for missing username.", async () => {
        req.body.username = "";
        const controller = loginUserController(Model, userSecretConfig);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("for missing password.", async () => {
        req.body.password = "";
        const controller = loginUserController(Model, userSecretConfig);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("for user not exist.", async () => {
        Model.findOne.mockReturnValue(mockFindOne(null));
        const controller = loginUserController(Model, userSecretConfig);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(Model.findOne).toHaveBeenCalledWith({
            username: req.body.username
        });
        expect(result).toMatchSnapshot();
    });

    test("for incorrect password.", async () => {
        const user = {
            username: "test",
            password: "hashedPassword",
            emailVerified: true,
            destroyDataAfter: Date.now() + 10000,
            toObject() { return { ...this }; }
        };
        Model.findOne.mockReturnValue(mockFindOne(user));
        jest.spyOn(passwordHashing, "comparePassword")
            .mockResolvedValue(false);
        const controller = loginUserController(Model, userSecretConfig);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(passwordHashing.comparePassword)
            .toHaveBeenCalledWith(req.body.password, user.password);
        expect(result).toMatchSnapshot();
    });

    test("for unverified email but not expired.", async () => {
        const user = {
            _id: "123",
            username: "test",
            password: "hashedPassword",
            emailVerified: false,
            destroyDataAfter: Date.now() + 10000,
            toObject() { return { ...this }; }
        };
        Model.findOne.mockReturnValue(mockFindOne(user));
        jest.spyOn(passwordHashing, "comparePassword")
            .mockResolvedValue(true);
        const controller = loginUserController(Model, userSecretConfig);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("delete expired unverified user", async () => {
        const user = {
            _id: "123",
            username: "test",
            password: "hashedPassword",
            emailVerified: false,
            destroyDataAfter: Date.now() - 1000,
            toObject() { return { ...this }; }
        };
        Model.findOne.mockReturnValue(mockFindOne(user));
        Model.findByIdAndDelete.mockResolvedValue(true);
        jest.spyOn(passwordHashing, "comparePassword")
            .mockResolvedValue(true);
        const controller = loginUserController(Model, userSecretConfig);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(Model.findByIdAndDelete).toHaveBeenCalledWith("123");
        expect(result).toMatchSnapshot();
    });

    test("for successful login.", async () => {
        const user = {
            _id: "507f1f77bcf86cd799439011",
            email: "test@gmail.com",
            fullname: "UserTest",
            password: "hashedPassword",
            username: "test",
            emailVerified: true,
            destroyDataAfter: Date.now() + 100000,
            toObject() {
                return {
                    _id: this._id,
                    email: this.email,
                    fullname: this.fullname,
                    username: this.username,
                    emailVerified: this.emailVerified
                };
            }
        };
        Model.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue(user)
        });
        jest.spyOn(passwordHashing, "comparePassword")
            .mockResolvedValue(true);
        generateJwtToken.mockReturnValue("fake-jwt-token");
        const controller = loginUserController(Model, userSecretConfig);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(result).toMatchSnapshot();
    });

    test("for internal server error.", async () => {
        Model.findOne.mockReturnValue({
            select: jest.fn().mockRejectedValue(new Error("DB Error"))
        });
        const controller = loginUserController(Model, userSecretConfig);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

});