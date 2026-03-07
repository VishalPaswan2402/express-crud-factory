import { beforeEach, describe, expect, jest, test } from '@jest/globals'
import getUserByIdController from '../../../src/controllers/userControllers/getUserById.controller';
import isValidUserId from '../../../src/middlewares/validUserId.middleware';

describe("Create Get-User-By-Id Controller Snapshot Test", () => {
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
            findById: jest.fn()
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
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
        expect(next).toHaveBeenCalled();
    });

    test("for user not exist.", async () => {
        Model.findById.mockResolvedValue(null);
        const controller = getUserByIdController(Model);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(Model.findById).toHaveBeenCalledWith(req.params.userId);
        expect(result).toMatchSnapshot();
    });

    test("for user found successfully.", async () => {
        let findData = {
            _id: "507f1f77bcf86cd799439011",
            email: "test@gmail.com",
            fullname: "UserTest",
            username: "test",
            isActive: true,
            articles: []
        };
        Model.findById.mockResolvedValue(findData);
        const controller = getUserByIdController(Model);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result.body.data.password).toBeUndefined();
        expect(Model.findById).toHaveBeenCalledWith(req.params.userId);
        expect(result).toMatchSnapshot();
    });

    test("internal server error.", async () => {
        Model.findById.mockRejectedValue(new Error("Server error"));
        const controller = getUserByIdController(Model);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

})