import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import { querySearch } from "../../../src/utils/querySearch.utils.js";

describe("querySearch Utils Test", () => {
    let PostModel;
    beforeEach(() => {
        PostModel = {
            countDocuments: jest.fn(),
            find: jest.fn()
        };
    });

    test("should return valid page data when page is within range", async () => {
        PostModel.countDocuments.mockResolvedValue(10);
        const result = await querySearch.pageRange(
            PostModel,
            {}, 1, 5
        );
        expect(PostModel.countDocuments).toHaveBeenCalled();
        expect(result).toEqual({
            value: true,
            totalDocument: 10,
            totalPages: 2,
            currentPage: 1
        });
    });

    test("should return false when page exceeds totalPages", async () => {
        PostModel.countDocuments.mockResolvedValue(10);
        const result = await querySearch.pageRange(
            PostModel,
            {}, 5, 5
        );
        expect(result).toEqual({
            value: false,
            totalPages: 2
        });
    });

    test("should handle zero documents correctly", async () => {
        PostModel.countDocuments.mockResolvedValue(0);
        const result = await querySearch.pageRange(
            PostModel,
            {}, 1, 5
        );
        expect(result).toEqual({
            value: true,
            totalDocument: 0,
            totalPages: 0,
            currentPage: 1
        });
    });

    test("should return paginated data correctly", async () => {
        const mockPosts = [
            { title: "Post 1" },
            { title: "Post 2" }
        ];
        const mockQuery = {
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue(mockPosts)
        };
        PostModel.find.mockReturnValue(mockQuery);
        const result = await querySearch.queryData(
            PostModel,
            {}, 0, 2, 2, 1, 1
        );
        expect(PostModel.find).toHaveBeenCalled();
        expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
        expect(mockQuery.skip).toHaveBeenCalledWith(0);
        expect(mockQuery.limit).toHaveBeenCalledWith(2);
        expect(result).toEqual({
            totalDocument: 2,
            totalPages: 1,
            currentPage: 1,
            data: mockPosts
        });
    });

    test("should return empty data if no posts found", async () => {
        const mockQuery = {
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue([])
        };
        PostModel.find.mockReturnValue(mockQuery);
        const result = await querySearch.queryData(
            PostModel,
            {}, 0, 5, 0, 0, 1
        );
        expect(result.data).toEqual([]);
        expect(result.totalDocument).toBe(0);
    });

    test("should throw error if DB fails", async () => {
        PostModel.find.mockImplementation(() => {
            throw new Error("DB Error");
        });
        await expect(
            querySearch.queryData(PostModel, {}, 0, 5, 0, 0, 1)
        ).rejects.toThrow("DB Error");
    });
});