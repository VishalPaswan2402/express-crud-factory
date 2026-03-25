import { describe, expect, test } from "@jest/globals";
import jwt from "jsonwebtoken";
import { generateJwtToken } from "../../../src/utils/generateJwtToken.utils.js";

describe("Generate JWT Token Utility Test", () => {
    const jwtSecret = {
        secret: "test-secret",
        expireIn: "1h"
    };
    const userData = {
        _id: "12345",
        username: "testUser"
    };

    test("should generate a valid JWT token", () => {
        const token = generateJwtToken(userData, jwtSecret);
        expect(token).toBeDefined();
        expect(typeof token).toBe("string");
    });

    test("should contain correct payload", () => {
        const token = generateJwtToken(userData, jwtSecret);
        const decoded = jwt.verify(token, jwtSecret.secret);
        expect(decoded.id).toBe(userData._id);
        expect(decoded.username).toBe(userData.username);
    });

    test("should include expiration", () => {
        const token = generateJwtToken(userData, jwtSecret);
        const decoded = jwt.decode(token);
        expect(decoded.exp).toBeDefined();
    });

    test("should throw error with invalid secret", () => {
        const badSecret = { secret: null, expireIn: "1h" };
        expect(() =>
            generateJwtToken(userData, badSecret)
        ).toThrow();
    });

});