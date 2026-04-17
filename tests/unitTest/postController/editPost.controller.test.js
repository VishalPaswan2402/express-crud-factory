import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import jsonValidate from "../../../src/middlewares/jsonValidate.middleware";
import editPostController from "../../../src/controllers/postControllers/editPost.controller";

describe("Edit Post Controller Snapshot Test", () => {
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
            },
            body: {
                title: "newUpdatedTitle",
                description: "newUpdatedDescription"
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

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("for empty request body,", async () => {
        req.body = {};
        jsonValidate(req, res, next);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(next).not.toHaveBeenCalled();
        expect(result).toMatchSnapshot();
    });

    test("for missing title.", async () => {
        req.body.title = "";
        const controller = editPostController(UserModel, PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

    test("for missing description.", async () => {
        req.body.description = "";
        const controller = editPostController(UserModel, PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

    test("for author not found.", async () => {
        UserModel.findById.mockResolvedValue(null);
        const controller = editPostController(UserModel, PostModel);
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
            username: "test",
            isActive: true,
            articles: []
        };
        UserModel.findById.mockResolvedValue(savedUser);
        PostModel.findById.mockResolvedValue(null);
        const controller = editPostController(UserModel, PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(UserModel.findById).toHaveBeenCalledWith(req.params.userId);
        expect(PostModel.findById).toHaveBeenCalledWith(req.params.postId);
        expect(result).toMatchSnapshot();
    });

    test("for post can't updated due to trashed", async () => {
        let savedUser = {
            _id: req.params.userId,
            email: "test@gmail.com",
            fullname: "UserTest",
            username: "test",
            isActive: true,
            articles: [req.params.postId]
        };
        UserModel.findById.mockResolvedValue(savedUser);
        const savedPost = {
            _id: req.params.postId,
            author: req.params.userId,
            description: "postDescription",
            title: "postTitle",
            isTrashed: true,
            save: jest.fn()
        };
        PostModel.findById.mockResolvedValue(savedPost);
        const controller = editPostController(UserModel, PostModel);
        await controller(req, res);
        expect(PostModel.findById).toHaveBeenCalledWith(req.params.postId);
        expect(savedPost.save).not.toHaveBeenCalled();
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

    test("for update post successfully.", async () => {
        let savedUser = {
            _id: req.params.userId,
            email: "test@gmail.com",
            fullname: "UserTest",
            username: "test",
            isActive: true,
            articles: [req.params.postId]
        };
        UserModel.findById.mockResolvedValue(savedUser);
        const savedPost = {
            _id: req.params.postId,
            author: req.params.userId,
            comments: 12,
            createdAt: "2026-03-04T17:00:19.599Z",
            updatedAt: "2026-03-04T17:40:19.599Z",
            description: "postDescription",
            likes: 924,
            title: "postTitle",
            isPinned: false,
            isTrashed: false,
            deletedAt: null,
            save: jest.fn().mockResolvedValue(true)
        };
        PostModel.findById
            .mockReturnValueOnce(savedPost)
            .mockReturnValueOnce({
                lean: jest.fn().mockResolvedValue({
                    id: savedPost._id,
                    author: savedPost.author,
                    comments: savedPost.comments,
                    createdAt: savedPost.createdAt,
                    updatedAt: savedPost.updatedAt,
                    description: req.body.description,
                    likes: savedPost.likes,
                    title: req.body.title,
                    isPinned: savedPost.isPinned,
                    isTrashed: savedPost.isTrashed,
                    deletedAt: savedPost.deletedAt
                })
            });
        const controller = editPostController(UserModel, PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(UserModel.findById).toHaveBeenCalledWith(req.params.userId);
        expect(PostModel.findById).toHaveBeenCalledWith(req.params.postId);
        expect(savedPost.title).toBe(req.body.title);
        expect(savedPost.description).toBe(req.body.description);
        expect(result).toMatchSnapshot();
    });

    test("for no permission to edit post.", async () => {
        UserModel.findById.mockResolvedValue({ _id: "user-123", username: "testuser" });
        const postData = { _id: "post-abc", title: "Test Post", author: "different-user-id" };
        PostModel.findById.mockResolvedValue(postData);
        const controller = editPostController(UserModel, PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(res.status).toHaveBeenCalledWith(403);
        expect(result).toMatchSnapshot();
    });

    test("for internal server error.", async () => {
        PostModel.findById.mockRejectedValue(new Error("Internal server error."));
        const controller = editPostController(PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

})