import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import createUserController from "../../../src/controllers/userControllers/createUser.controller";

describe("Create User Controller Snapshot Test", () => {
    let req;
    let res;
    let Model;
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
    });

    test("for missing fields.", async () => {
        req.body.email = "";
        const controller = createUserController(Model);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

    test("for password mismatch.", async () => {
        req.body.confirmPassword = "wrongPassword";
        const controller = createUserController(Model);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        }
        expect(result).toMatchSnapshot();
    });

    test("for username already exist.", async () => {
        Model.findOne.mockResolvedValue({ username: "test" });
        const controller = createUserController(Model);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        }
        expect(result).toMatchSnapshot();
    });

    test("for email already exist.", async () => {
        Model.findOne.mockResolvedValue({ email: "test@gmail.com" });
        const controller = createUserController(Model);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        }
        expect(result).toMatchSnapshot();
    });

    test("for empty request body.", async () => {
        req.body = {};
        const controller = createUserController(Model);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        }
        expect(result).toMatchSnapshot();
    })

    test("for user created successfully.", async () => {
        Model.findOne.mockResolvedValue(null);
        const mockSave = jest.fn().mockResolvedValue({
            _id: "123",
            ...req.body
        });
        const MockModel = jest.fn().mockImplementation(() => ({
            save: mockSave
        }));
        MockModel.findOne = Model.findOne;
        const controller = createUserController(MockModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        }
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