import { beforeEach, describe, expect, jest } from "@jest/globals";
import isValidUserPostId from "../../../src/middlewares/validUserPostId.middleware";
import getPostController from "../../../src/controllers/postControllers/getPost.controller";

describe("Get Post Controller Snapshot Test", () => {
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
            findById: jest.fn()
        };
        next = jest.fn();
    });

    test("for user Id or post Id not found.", async () => {
        req.params.userId = ""
        isValidUserPostId(req, res, next);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(next).not.toHaveBeenCalled();
        expect(result).toMatchSnapshot();
    });

    test("for valid user Id and post Id.", async () => {
        isValidUserPostId(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    test("for not valid post Id.", async () => {
        req.params.postId = "456";
        isValidUserPostId(req, res, next);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(next).not.toHaveBeenCalled();
        expect(result).toMatchSnapshot();
    });

    test("for not valid user Id.", async () => {
        req.params.userId = "123";
        isValidUserPostId(req, res, next);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(next).not.toHaveBeenCalled();
        expect(result).toMatchSnapshot();
    });

    test("for author not found.", async () => {
        UserModel.findById.mockResolvedValue(null);
        const controller = getPostController(UserModel, PostModel);
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
        PostModel.findById.mockResolvedValue(null);
        const controller = getPostController(UserModel, PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(UserModel.findById).toHaveBeenCalledWith(req.params.userId);
        expect(PostModel.findById).toHaveBeenCalledWith(req.params.postId);
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
            description: "postDescription",
            likes: 924,
            title: "postTitle",
        };
        PostModel.findById.mockResolvedValue(savedPost);
        const controller = getPostController(UserModel, PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(UserModel.findById).toHaveBeenCalledWith(req.params.userId);
        expect(PostModel.findById).toHaveBeenCalledWith(req.params.postId);
        expect(findData.articles).toContain(req.params.postId);
        expect(result).toMatchSnapshot();
    });

    test("for no permission to view post.", async () => {
        UserModel.findById.mockResolvedValue({ _id: "user-123", username: "testuser" });
        const postData = { _id: "post-abc", title: "Test Post", author: "different-user-id" };
        PostModel.findById.mockResolvedValue(postData);
        const controller = getPostController(UserModel, PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(res.status).toHaveBeenCalledWith(403);
        expect(result).toMatchSnapshot();
    })

    test("for internal server error.", async () => {
        UserModel.findById.mockRejectedValue(new Error("Internal server error."));
        const controller = getPostController(UserModel, PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

})