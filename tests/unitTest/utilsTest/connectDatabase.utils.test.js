import { describe, expect, jest, test, beforeEach, afterEach } from "@jest/globals";
import mongoose from "mongoose";
import { connectDatabase } from "../../../src/utils/connectDatabase.utils.js";

describe("connectDatabase Utility Test", () => {
    beforeEach(() => {
        jest.spyOn(console, "log").mockImplementation(() => { });
        jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("for throw error if db_url is not provided", async () => {
        await expect(connectDatabase()).rejects.toThrow("Database URL is required");
    });

    test("for connect to database successfully", async () => {
        jest.spyOn(mongoose, "connect").mockResolvedValue(true);
        await connectDatabase("mongodb://localhost:27017/testdb");
        expect(mongoose.connect).toHaveBeenCalledWith("mongodb://localhost:27017/testdb");
        expect(console.log).toHaveBeenCalledWith("MongoDB database connected successfully");
    });

    test("for handle connection error", async () => {
        const mockError = new Error("Connection failed");
        jest.spyOn(mongoose, "connect").mockRejectedValue(mockError);
        await expect(
            connectDatabase("mongodb://localhost:27017/testdb")
        ).rejects.toThrow("Connection failed");
        expect(console.error).toHaveBeenCalledWith(
            "MongoDB database connection failed:",
            mockError
        );
    });

});