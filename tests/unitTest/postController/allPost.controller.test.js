import { beforeEach, beforeAll, afterEach, describe, expect, jest } from "@jest/globals";
import isValidUserId from "../../../src/middlewares/validUserId.middleware.js";

const mockPageRange = jest.fn();
const mockQueryData = jest.fn();

jest.unstable_mockModule("../../../src/utils/querySearch.utils.js", () => ({
    querySearch: {
        pageRange: mockPageRange,
        queryData: mockQueryData
    }
}));

let allPostController;
let querySearch;

beforeAll(async () => {
    const qsModule = await import("../../../src/utils/querySearch.utils.js");
    querySearch = qsModule.querySearch;
    const controllerModule = await import(
        "../../../src/controllers/postControllers/allPost.controller.js"
    );
    allPostController = controllerModule.default;
});

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
            },
            query: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        UserModel = {
            findById: jest.fn()
        };
        PostModel = {};
        next = jest.fn();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("for user Id not found.", () => {
        req.params.userId = "";
        isValidUserId(req, res, next);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(next).not.toHaveBeenCalled();
        expect(result).toMatchSnapshot();
    });

    test("for valid user Id.", () => {
        isValidUserId(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    test("for not valid user Id.", () => {
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

    test("for page exceeds total pages.", async () => {
        UserModel.findById.mockResolvedValue({ _id: req.params.userId });
        querySearch.pageRange.mockResolvedValue({
            value: false,
            totalPages: 2
        });
        const controller = allPostController(UserModel, PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

    test("for post article not found.", async () => {
        UserModel.findById.mockResolvedValue({ _id: req.params.userId });
        querySearch.pageRange.mockResolvedValue({
            value: true,
            totalPages: 1,
            totalDocument: 0,
            currentPage: 1
        });
        querySearch.queryData.mockResolvedValue({
            data: [],
            totalDocument: 0,
            totalPages: 1,
            currentPage: 1
        });
        const controller = allPostController(UserModel, PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
        expect(result).toMatchSnapshot();
    });

    test("for post article found successfully.", async () => {
        UserModel.findById.mockResolvedValue({ _id: req.params.userId });
        const savedPost = {
            _id: req.params.postId,
            author: req.params.userId,
            title: "postTitle",
            comments: 12,
            createdAt: "2026-03-04T17:00:19.599Z",
            deletedAt: null,
            description: "postDescription",
            isPinned: false,
            isTrashed: false,
            likes: 924,
            updatedAt: "2026-03-04T17:00:19.599Z"
        };
        querySearch.pageRange.mockResolvedValue({
            value: true,
            totalPages: 1,
            totalDocument: 1,
            currentPage: 1
        });
        querySearch.queryData.mockResolvedValue({
            data: [savedPost],
            totalDocument: 1,
            totalPages: 1,
            currentPage: 1
        });
        const controller = allPostController(UserModel, PostModel);
        await controller(req, res);
        const result = {
            status: res.status.mock.calls[0][0],
            body: res.json.mock.calls[0][0]
        };
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
});