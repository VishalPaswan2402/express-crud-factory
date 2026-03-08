import { beforeEach, describe, expect, jest } from '@jest/globals'
import jsonValidate from '../../../src/middlewares/jsonValidate.middleware';
import loginUserController from '../../../src/controllers/userControllers/loginUser.controller';
import { passwordHashing } from '../../../src/utils/passwordHashing.utils';

await jest.unstable_mockModule("../../../src/utils/generateJwtToken.utils.js", () => ({
    generateJwtToken: jest.fn()
}));

const { generateJwtToken } = await import("../../../src/utils/generateJwtToken.utils.js");

describe("Create Login User Controller Snapshot Test", () => {
    let req;
    let res;
    let Model;
    let next;
    let userSecretConfig;

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
            findOne: jest.fn()
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

    test("for expty request body.", async () => {
        req.body = {};
        jsonValidate(req, res, next);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(next).not.toHaveBeenCalled();
        expect(result).toMatchSnapshot();
    });

    test("for missing username.", async () => {
        req.body.username = "";
        const controller = loginUserController(Model, userSecretConfig);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

    test("for missing password.", async () => {
        req.body.password = "";
        const controller = loginUserController(Model, userSecretConfig);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

    test("for successfull login.", async () => {
        let savedData = {
            _id: "507f1f77bcf86cd799439011",
            email: "test@gmail.com",
            fullname: "UserTest",
            password: "hashedPassword",
            username: "test",
            isActive: true,
            articles: [],
            toObject: function () {
                const { toObject, ...rest } = this;
                return { ...rest };
            }
        };
        Model.findOne = jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue(savedData)
        });
        jest.spyOn(passwordHashing, "comparePassword").mockResolvedValue(true);
        generateJwtToken.mockResolvedValue("fake-jwt-token");
        const controller = loginUserController(Model, userSecretConfig);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: { ...res.json.mock.calls[0][0], token: "fake-jwt-token" }
        };
        expect(Model.findOne).toHaveBeenCalledWith({
            username: req.body.username
        });
        expect(passwordHashing.comparePassword).toHaveBeenCalledWith(req.body.password, savedData.password);
        expect(result).toMatchSnapshot();
    });

    test("for incorrect password.", async () => {
        let savedData = {
            _id: "507f1f77bcf86cd799439011",
            email: "test@gmail.com",
            fullname: "UserTest",
            username: "test",
            isActive: true,
            articles: [],
            toObject: function () { return { ...this }; }
        };
        Model.findOne = jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue(savedData)
        });
        jest.spyOn(passwordHashing, "comparePassword").mockResolvedValue(false);
        const controller = loginUserController(Model, userSecretConfig);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(passwordHashing.comparePassword).toHaveBeenCalledWith(req.body.password, savedData.password);
        expect(result).toMatchSnapshot();
    });

    test("for checking user not exist.", async () => {
        const selectMock = jest.fn().mockResolvedValue(null);
        Model.findOne = jest.fn(() => ({ select: selectMock }));
        const controller = loginUserController(Model, userSecretConfig);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(Model.findOne).toHaveBeenCalledWith({
            username: req.body.username
        });
        expect(result).toMatchSnapshot();
    });

    test("for internal server error.", async () => {
        Model.findOne = jest.fn().mockReturnValue({
            select: jest.fn().mockRejectedValue(new Error("Server error"))
        });
        const controller = loginUserController(Model, userSecretConfig);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

})