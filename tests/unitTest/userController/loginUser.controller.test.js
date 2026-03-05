import { beforeEach, describe, expect, jest } from '@jest/globals'
import jsonValidate from '../../../src/middlewares/jsonValidate.middleware';
import loginUserController from '../../../src/controllers/userControllers/loginUser.controller';

describe("Create Login User Controller Snapshot Test", () => {
    let req;
    let res;
    let Model;
    let next;

    beforeEach(() => {
        req = {
            body: {
                username: "test",
                password: "testPassword"
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        Model = {
            findOne: jest.fn()
        };
        next = jest.fn();
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
        const controller = loginUserController(Model);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

    test("for missing password.", async () => {
        req.body.password = "";
        const controller = loginUserController(Model);
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
            password: "testPassword",
            username: "test",
            isActive: true,
            articles: []
        };
        Model.findOne.mockResolvedValue(savedData);
        const controller = loginUserController(Model);
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

    test("for incorrect password.", async () => {
        let savedData = {
            _id: "507f1f77bcf86cd799439011",
            email: "test@gmail.com",
            fullname: "UserTest",
            password: "testPassword",
            username: "test",
            isActive: true,
            articles: []
        };
        Model.findOne.mockResolvedValue(savedData);
        req.body.password = "wrongPassword";
        const controller = loginUserController(Model);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

    test("for checking user not exist.", async () => {
        Model.findOne.mockResolvedValue(null);
        const controller = loginUserController(Model);
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
        Model.findOne.mockRejectedValue(new Error("Server error"));
        const controller = loginUserController(Model);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

})