import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import isValidUserPostId from "../../../src/middlewares/validUserPostId.middleware";
import deletePostController from "../../../src/controllers/postControllers/deletePost.controller";

describe("Delete Post Controller Snapshot Test", () => {
    let req;
    let res;
    let UserModel;
    let PostModel;
    let next;

    beforeEach(() => {
        req = {
            params: {
                userId: "507f1f77bcf86cd799439011",
                postId: "69a8652b69726b384c21b27d"
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        UserModel = {
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn()
        };
        PostModel = {
            findByIdAndDelete: jest.fn()
        };
        next = jest.fn();
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

    test("for author not found.", async () => {
        UserModel.findById.mockResolvedValue(null);
        const controller = deletePostController(UserModel, PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

    test("for post not found.", async () => {
        let savedData = {
            _id: req.params.userId,
            email: "test@gmail.com",
            fullname: "UserTest",
            password: "testPassword",
            username: "test",
            isActive: true,
            articles: []
        };
        UserModel.findById.mockResolvedValue(savedData);
        PostModel.findByIdAndDelete.mockResolvedValue(null);
        const controller = deletePostController(UserModel, PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

    test("for post deleted successfully.", async () => {
        let savedData = {
            _id: req.params.userId,
            email: "test@gmail.com",
            fullname: "UserTest",
            password: "testPassword",
            username: "test",
            isActive: true,
            articles: [req.params.postId]
        };
        UserModel.findById.mockResolvedValue(savedData);
        const savedPost = {
            _id: req.params.postId,
            author: req.params.userId,
            comments: 12,
            createdAt: "2026-03-04T17:00:19.599Z",
            description: "postDescription",
            like: 924,
            title: "postTitle"
        };
        PostModel.findByIdAndDelete.mockResolvedValue(savedPost);
        let updateData = {
            ...savedData,
            articles: []
        };
        UserModel.findByIdAndUpdate.mockResolvedValue(updateData);
        const controller = deletePostController(UserModel, PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(PostModel.findByIdAndDelete).toHaveBeenCalledWith(req.params.postId);
        expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(req.params.userId, {
            $pull: { articles: req.params.postId },
        });
        expect(updateData.articles).not.toContain(req.params.postId);
        expect(result).toMatchSnapshot();
    });

    test("for internal server error.", async () => {
        PostModel.findByIdAndDelete.mockRejectedValue(new Error("Internal server error."));
        const controller = deletePostController(PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

})