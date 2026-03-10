import { beforeEach, describe, expect, jest } from "@jest/globals";
import isValidUserId from "../../../src/middlewares/validUserId.middleware";
import allPostController from "../../../src/controllers/postControllers/allPost.controller";

describe("Get All Post Controller Snapshot Test", () => {
    let req;
    let res;
    let UserModel;
    let PostModel;
    let next;

    beforeEach(() => {
        req = {
            params: {
                postId: "69a8652b69726b384c21b27d",
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
        PostModel = {
            findById: jest.fn(),
            find: jest.fn()
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("for user Id not found.", async () => {
        req.params.userId = ""
        isValidUserId(req, res, next);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(next).not.toHaveBeenCalled();
        expect(result).toMatchSnapshot();
    });

    test("for valid user Id.", async () => {
        isValidUserId(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    test("for not valid user Id.", async () => {
        req.params.userId = "123";
        isValidUserId(req, res, next);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(next).not.toHaveBeenCalled();
        expect(result).toMatchSnapshot();
    });

    test("for author not found.", async () => {
        UserModel.findById.mockResolvedValue(null);
        const controller = allPostController(UserModel, PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

    test("for post article not found.", async () => {
        let savedUser = {
            _id: req.params.userId,
            email: "test@gmail.com",
            fullname: "UserTest",
            password: "testPassword",
            username: "test",
            isActive: true,
            articles: []
        };
        UserModel.findById.mockResolvedValue(savedUser);
        PostModel.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
        });
        const controller = allPostController(UserModel, PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(UserModel.findById).toHaveBeenCalledWith(req.params.userId);
        expect(PostModel.find).toHaveBeenCalledWith({ author: req.params.userId });
        expect(result).toMatchSnapshot();
    });

    test("for post article found successfully.", async () => {
        let findData = {
            _id: "507f1f77bcf86cd799439011",
            email: "test@gmail.com",
            fullname: "UserTest",
            password: "testPassword",
            username: "test",
            isActive: true,
            articles: [req.params.postId]
        };
        UserModel.findById.mockResolvedValue(findData);
        const savedPost = {
            _id: req.params.postId,
            author: req.params.userId,
            comments: 12,
            createdAt: "2026-03-04T17:00:19.599Z",
            updatedAt: "2026-03-04T17:00:19.599Z",
            description: "postDescription",
            likes: 924,
            title: "postTitle",
            isPinned: false,
            isTrashed: false,
            deletedAt: null
        };
        PostModel.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue(savedPost)
        });
        const controller = allPostController(UserModel, PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(UserModel.findById).toHaveBeenCalledWith(req.params.userId);
        expect(PostModel.find).toHaveBeenCalledWith({ author: req.params.userId });
        expect(savedPost.author).toContain(req.params.userId);
        expect(result).toMatchSnapshot();
    });

    test("for internal server error.", async () => {
        UserModel.findById.mockRejectedValue(new Error("Internal server error."));
        const controller = allPostController(UserModel, PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

})