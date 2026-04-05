import { beforeEach, describe, expect, jest } from "@jest/globals";
import searchByTitle from "../../../src/controllers/postControllers/searchByTitle.controller.js";

describe("Search By Title Controller Snapshot Tests", () => {
    let req, res, PostModel;
    const sanitizeResponse = (res) => {
        const body = { ...res.json.mock.calls[0][0] };
        if (body?.token) {
            body.token = "mocked-jwt-token";
        }
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
        PostModel = {
            countDocuments: jest.fn(),
            find: jest.fn()
        };
    });

    test("for should return 400 if search text missing.", async () => {
        req.query = {};
        req.params = { userId: "123" };
        const controller = searchByTitle(PostModel);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("for should return 400 if userId missing.", async () => {
        req.query = { search: "react" };
        req.params = {};
        const controller = searchByTitle(PostModel);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("for should return 400 if page exceeds total pages.", async () => {
        req.query = { search: "react", page: "5", limit: "2" };
        req.params = { userId: "123" };
        PostModel.countDocuments.mockResolvedValue(3); // totalPages = 2
        const controller = searchByTitle(PostModel);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("for should return posts successfully.", async () => {
        req.query = { search: "react", page: "1", limit: "2" };
        req.params = { userId: "123" };
        const mockPosts = [
            { title: "React Guide", author: "123" },
            { title: "Learning React", author: "123" }
        ];
        PostModel.countDocuments.mockResolvedValue(2);
        PostModel.find.mockReturnValue({
            skip: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue(mockPosts)
            })
        });
        const controller = searchByTitle(PostModel);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("for should return no data message when empty result.", async () => {
        req.query = { search: "unknown", page: "1", limit: "2" };
        req.params = { userId: "123" };
        PostModel.countDocuments.mockResolvedValue(0);
        PostModel.find.mockReturnValue({
            skip: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([])
            })
        });
        const controller = searchByTitle(PostModel);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });

    test("for should handle server error.", async () => {
        req.query = { search: "react" };
        req.params = { userId: "123" };
        PostModel.countDocuments.mockRejectedValue(new Error("DB Error"));
        const controller = searchByTitle(PostModel);
        await controller(req, res);
        const result = sanitizeResponse(res);
        expect(result).toMatchSnapshot();
    });
});