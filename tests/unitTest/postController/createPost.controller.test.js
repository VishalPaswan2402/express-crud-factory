import { beforeEach, describe, jest, test, expect } from '@jest/globals';
import jsonValidate from '../../../src/middlewares/jsonValidate.middleware';
import createPostController from '../../../src/controllers/postControllers/createPost.controller';
import isValidUserId from '../../../src/middlewares/validUserId.middleware';

describe("Create Post Controller Snapshot Test", () => {
    let req;
    let res;
    let UserModel;
    let PostModel;
    let next;

    beforeEach(() => {
        req = {
            body: {
                title: "postTitle",
                description: "postDescription"
            },
            params: {
                userId: "507f1f77bcf86cd799439011"
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        UserModel = {
            findById: jest.fn()
        };
        next = jest.fn();
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

    test("for invalid user-id.", () => {
        req.params.userId = "123";
        isValidUserId(req, res, next);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(next).not.toHaveBeenCalled();
        expect(result).toMatchSnapshot();
    });

    test("for valid user-id.", async () => {
        isValidUserId(req, res, next);
        UserModel.findById.mockResolvedValue(null);
        const controller = createPostController(UserModel, PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        }
        expect(UserModel.findById).toHaveBeenCalledWith(req.params.userId);
        expect(result).toMatchSnapshot();
        expect(next).toHaveBeenCalled();
    });

    test("for missing title.", async () => {
        req.body.title = "";
        const controller = createPostController(UserModel, PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

    test("for missing description.", async () => {
        req.body.description = "";
        const controller = createPostController(UserModel, PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

    test("when user not found.", async () => {
        UserModel.findById.mockResolvedValue(null);
        const controller = createPostController(UserModel, PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(UserModel.findById).toHaveBeenCalledWith(req.params.userId);
        expect(result).toMatchSnapshot();
    });

    test("for successful post creation.", async () => {
        const savedUser = {
            _id: "507f1f77bcf86cd799439011",
            email: "test@gmail.com",
            fullname: "UserTest",
            password: "testPassword",
            username: "test",
            isActive: true,
            articles: [],
            save: jest.fn().mockResolvedValue(true)
        };
        UserModel.findById.mockResolvedValue(savedUser);
        PostModel = function (data) {
            this.title = data.title;
            this.description = data.description;
            this.author = data.author;
            this._id = "507f1f77bcf86cd799438978";
            this.createdAt = "2026-03-04T17:00:19.599Z",
                this.likes = 924,
                this.comments = 12,
                this.save = jest.fn().mockResolvedValue({
                    _id: this._id,
                    title: this.title,
                    description: this.description,
                    author: this.author,
                    like: this.likes,
                    comments: this.comments,
                    createdAt: this.createdAt
                });
        };
        const controller = createPostController(UserModel, PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(UserModel.findById).toHaveBeenCalledWith(req.params.userId);
        expect(savedUser.articles).toContain("507f1f77bcf86cd799438978");
        expect(savedUser.save).toHaveBeenCalled();
        expect(result).toMatchSnapshot();
    });

    test("for error while saving post.", async () => {
        const savedUser = {
            _id: "507f1f77bcf86cd799439011",
            email: "test@gmail.com",
            fullname: "UserTest",
            password: "testPassword",
            username: "test",
            isActive: true,
            articles: [],
            save: jest.fn().mockResolvedValue(true)
        };
        UserModel.findById.mockResolvedValue(savedUser);
        PostModel = function (data) {
            this.title = data.title;
            this.description = data.description;
            this.author = data.author;
            this._id = "507f1f77bcf86cd799438978";
            this.save = jest.fn().mockRejectedValue(new Error("DB error"));
        };
        const controller = createPostController(UserModel, PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

});