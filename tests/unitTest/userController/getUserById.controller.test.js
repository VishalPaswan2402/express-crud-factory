import { beforeEach, describe, expect, jest, test } from '@jest/globals'
import getUserByIdController from '../../../src/controllers/userControllers/getUserById.controller';
import isValidUserId from '../../../src/middlewares/validUserId.middleware';

describe("Create Get-User-By-Id Controller Snapshot Test", () => {
    let req;
    let res;
    let Model;
    let next;
    const sanitizeResponse = (res) => {
        const body = { ...res.json.mock.calls[0][0] };
        if (body?.data?._id) body.data._id = "mocked-id";
        if (body?.data?.userId) body.data.userId = "mocked-user-id";
        return {
            status: res.status.mock.calls[0][0],
            body
        };
    };
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
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for invalid user-id.", () => {
        req.params.userId = "123";
        isValidUserId(req, res, next);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for valid user-id.", async () => {
        isValidUserId(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    test("for user not exist.", async () => {
        Model.findById.mockResolvedValue(null);
        const controller = getUserByIdController(Model);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for user found successfully.", async () => {
        let findData = {
            _id: "507f1f77bcf86cd799439011",
            email: "test@gmail.com",
            fullname: "UserTest",
            username: "test",
            isActive: true,
            emailVerified: true,
            articles: []
        };
        Model.findById.mockResolvedValue(findData);
        const controller = getUserByIdController(Model);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for email not verified.", async () => {
        let findData = {
            _id: "507f1f77bcf86cd799439011",
            email: "test@gmail.com",
            fullname: "UserTest",
            username: "test",
            isActive: false,
            emailVerified: false,
            articles: []
        };
        Model.findById.mockResolvedValue(findData);
        const controller = getUserByIdController(Model);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for user blocked.", async () => {
        let findData = {
            _id: "507f1f77bcf86cd799439011",
            email: "test@gmail.com",
            fullname: "UserTest",
            username: "test",
            isActive: false,
            emailVerified: true,
            articles: []
        };
        Model.findById.mockResolvedValue(findData);
        const controller = getUserByIdController(Model);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("internal server error.", async () => {
        Model.findById.mockRejectedValue(new Error("Server error"));
        const controller = getUserByIdController(Model);
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

})