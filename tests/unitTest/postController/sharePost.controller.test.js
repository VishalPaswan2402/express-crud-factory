import { beforeEach, describe, jest } from "@jest/globals";
import isValidPostId from "../../../src/middlewares/validPostId.middleware.js";
import sharePostController from "../../../src/controllers/postControllers/sharePost.controller";

describe("Share Post Controller Snapshot Test", () => {
    let req;
    let res;
    let PostModel;
    let next;
    beforeEach(() => {
        req = {
            params: {
                postId: "69a8652b69726b384c21b27d"
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        PostModel = {
            findById: jest.fn()
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("for post Id not found.", async () => {
        req.params.postId = ""
        isValidPostId(req, res, next);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(next).not.toHaveBeenCalled();
        expect(result).toMatchSnapshot();
    });

    test("for valid post Id.", async () => {
        isValidPostId(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    test("for not valid post Id.", async () => {
        req.params.postId = "456";
        isValidPostId(req, res, next);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(next).not.toHaveBeenCalled();
        expect(result).toMatchSnapshot();
    });

    test("for post article not found.", async () => {
        PostModel.findById.mockResolvedValue(null);
        const controller = sharePostController(PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(PostModel.findById).toHaveBeenCalledWith(req.params.postId);
        expect(result).toMatchSnapshot();
    });

    test("for shared post can't view due to trashed", async () => {
        const savedPost = {
            _id: req.params.postId,
            author: req.params.userId,
            description: "postDescription",
            title: "postTitle",
            isTrashed: true,
            save: jest.fn()
        };
        PostModel.findById.mockResolvedValue(savedPost);
        const controller = sharePostController(PostModel);
        await controller(req, res);
        expect(PostModel.findById).toHaveBeenCalledWith(req.params.postId);
        expect(savedPost.save).not.toHaveBeenCalled();
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

    test("for post article found successfully.", async () => {
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
        PostModel.findById.mockResolvedValue(savedPost);
        const controller = sharePostController(PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(PostModel.findById).toHaveBeenCalledWith(req.params.postId);
        expect(result).toMatchSnapshot();
    });

    test("for internal server error.", async () => {
        PostModel.findById.mockRejectedValue(new Error("Internal server error."));
        const controller = sharePostController(PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

})