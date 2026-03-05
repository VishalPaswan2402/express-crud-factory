import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import isValidUserId from "../../../src/middlewares/validUserId.middleware";
import destroyUserController from "../../../src/controllers/userControllers/destroyUser.controller";

describe("Create Destroy User Controller Snapshot Test", () => {
    let req;
    let res;
    let Model;
    let next;
    beforeEach(() => {
        req = {
            params: {
                userId: "507f1f77bcf86cd799439011"
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        Model = {
            findByIdAndDelete: jest.fn()
        };
        next = jest.fn();
    });

    test("for invalid user-id.", () => {
        req.params.userId = "123";
        isValidUserId(req, res, next);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
        expect(next).not.toHaveBeenCalled();
    });

    test("for valid user-id.", async () => {
        isValidUserId(req, res, next);
        Model.findByIdAndDelete.mockResolvedValue(null);
        const controller = destroyUserController(Model);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        }
        expect(Model.findByIdAndDelete).toHaveBeenCalledWith(req.params.userId);
        expect(result).toMatchSnapshot();
        expect(next).toHaveBeenCalled();
    });

    test("for empty user-id.", () => {
        req.params = {};
        isValidUserId(req, res, next);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
        expect(next).not.toHaveBeenCalled();
    });

    test("for user with user-id not found.", async () => {
        Model.findByIdAndDelete.mockResolvedValue(null);
        const controller = destroyUserController(Model);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(Model.findByIdAndDelete).toHaveBeenCalledWith(req.params.userId);
        expect(result).toMatchSnapshot();
    });

    test("for find user by Id and delete it.", async () => {
        let savedData = {
            _id: req.params.userId,
            email: "test@gmail.com",
            fullname: "UserTest",
            password: "testPassword",
            username: "test",
            isActive: true,
            articles: []
        };
        Model.findByIdAndDelete.mockResolvedValue(savedData);
        const controller = destroyUserController(Model);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(Model.findByIdAndDelete).toHaveBeenCalledWith(req.params.userId);
        expect(result).toMatchSnapshot();
    });

    test("for internal server error.", async () => {
        Model.findByIdAndDelete.mockRejectedValue(new Error("Internal server error."));
        const controller = destroyUserController(Model);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

})