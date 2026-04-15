import { beforeEach, beforeAll, describe, expect, jest } from "@jest/globals";

const mockPageRange = jest.fn();
const mockQueryData = jest.fn();

jest.unstable_mockModule("../../../src/utils/querySearch.utils.js", () => ({
    querySearch: {
        pageRange: mockPageRange,
        queryData: mockQueryData
    }
}));

let searchByTitleController;

beforeAll(async () => {
    const module = await import(
        "../../../src/controllers/postControllers/searchByTitle.controller.js"
    );
    searchByTitleController = module.default;
});

describe("Search By Title Controller Snapshot Tests", () => {
    let req, res, PostModel;
    const sanitizeResponse = (res) => {
        const body = { ...res.json.mock.calls[0][0] };
        return {
            status: res.status.mock.calls[0][0],
            body
        };
    };
    beforeEach(() => {
        req = {
            query: {},
            params: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        PostModel = {};
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("for search text missing.", async () => {
        req.query = {};
        req.params = { userId: "123" };
        const controller = searchByTitleController(PostModel);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("for userId missing.", async () => {
        req.query = { text: "react" };
        req.params = {};
        const controller = searchByTitleController(PostModel);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("for page exceeds total pages.", async () => {
        req.query = { text: "react", page: "5", limit: "2" };
        req.params = { userId: "123" };
        mockPageRange.mockResolvedValue({
            value: false,
            totalPages: 2
        });
        const controller = searchByTitleController(PostModel);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("for find posts successfully.", async () => {
        req.query = { text: "react", page: "1", limit: "2" };
        req.params = { userId: "123" };
        const mockPosts = [
            { title: "React Guide", author: "123" },
            { title: "Learning React", author: "123" }
        ];
        mockPageRange.mockResolvedValue({
            value: true,
            totalPages: 1,
            totalDocument: 2,
            currentPage: 1
        });
        mockQueryData.mockResolvedValue({
            data: mockPosts,
            totalDocument: 2,
            totalPages: 1,
            currentPage: 1
        });
        const controller = searchByTitleController(PostModel);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("for no result found.", async () => {
        req.query = { text: "unknown", page: "1", limit: "2" };
        req.params = { userId: "123" };
        mockPageRange.mockResolvedValue({
            value: true,
            totalPages: 1,
            totalDocument: 0,
            currentPage: 1
        });
        mockQueryData.mockResolvedValue({
            data: [],
            totalDocument: 0,
            totalPages: 1,
            currentPage: 1
        });
        const controller = searchByTitleController(PostModel);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("for should handle server error.", async () => {
        req.query = { text: "react" };
        req.params = { userId: "123" };
        mockPageRange.mockRejectedValue(new Error("DB Error"));
        const controller = searchByTitleController(PostModel);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });
});