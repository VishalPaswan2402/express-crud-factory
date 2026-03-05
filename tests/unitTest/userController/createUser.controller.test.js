import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import createUserController from "../../../src/controllers/userControllers/createUser.controller";
import jsonValidate from "../../../src/middlewares/jsonValidate.middleware";

describe("Create User Controller Snapshot Test", () => {
    let req;
    let res;
    let Model;
    let next;
    beforeEach(() => {
        req = {
            body: {
                email: "test@gmail.com",
                username: "test",
                fullname: "UserTest",
                password: "testPassword",
                confirmPassword: "testPassword"
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

    test("for missing fields.", async () => {
        jsonValidate(req, res, next);
        req.body.email = "";
        const controller = createUserController(Model);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(next).toHaveBeenCalled();
        expect(result).toMatchSnapshot();
    });

    test("for password mismatch.", async () => {
        req.body.confirmPassword = "wrongPassword";
        const controller = createUserController(Model);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

    test("for username already exist.", async () => {
        Model.findOne.mockResolvedValue({ username: "test" });
        const controller = createUserController(Model);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(Model.findOne).toHaveBeenCalledWith({
            $or: [
                { username: "test" },
                { email: "test@gmail.com" }
            ]
        });
        expect(result).toMatchSnapshot();
    });

    test("for email already exist.", async () => {
        Model.findOne.mockResolvedValue({ email: "test@gmail.com" });
        const controller = createUserController(Model);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(Model.findOne).toHaveBeenCalledWith({
            $or: [
                { username: "test" },
                { email: "test@gmail.com" }
            ]
        });
        expect(result).toMatchSnapshot();
    });

    test("for empty request body.", () => {
        req.body = {};
        jsonValidate(req, res, next);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(next).not.toHaveBeenCalled();
        expect(result).toMatchSnapshot();
    });

    test("for user created successfully.", async () => {
        let savedData = {
            _id: "507f1f77bcf86cd799439011",
            email: "test@gmail.com",
            fullname: "UserTest",
            password: "testPassword",
            username: "test",
            isActive: true,
            articles: []
        };
        Model.findOne.mockResolvedValue(null);
        const mockSave = jest.fn().mockResolvedValue(savedData);
        const MockModel = jest.fn().mockImplementation(() => ({
            save: mockSave
        }));
        MockModel.findOne = Model.findOne;
        const controller = createUserController(MockModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

    test("user saving failed.", async () => {
        Model.findOne.mockResolvedValue(null);
        const mockSave = jest.fn().mockRejectedValue(new Error("Save failed"));
        const MockModel = jest.fn().mockImplementation(() => ({
            save: mockSave
        }));
        MockModel.findOne = Model.findOne;
        const controller = createUserController(MockModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

    test("for server error.", async () => {
        Model.findOne.mockRejectedValue(new Error("DB Error"));
        const controller = createUserController(Model);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

})