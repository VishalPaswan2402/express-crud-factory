import { describe, expect, test } from "@jest/globals";
import jwt from "jsonwebtoken";
import { generateJwtAccessToken, generateJwtRefreshToken } from "../../../src/utils/generateJwtToken.utils.js";

describe("Generate JWT Token Utility Test", () => {
    const jwtSecret = {
        secret: "test-secret",
        expireIn: "1h",
        refreshKey: "test-refresh",
        refreshExpireIn: "7d"
    };
    const userData = {
        _id: "12345",
        username: "testUser"
    };

    test("should generate a valid JWT token by generateJwtAccessToken function.", () => {
        const token = generateJwtAccessToken(userData, jwtSecret);
        expect(token).toBeDefined();
        expect(typeof token).toBe("string");
    });

    test("should contain correct payload in generateJwtAccessToken function.", () => {
        const token = generateJwtAccessToken(userData, jwtSecret);
        const decoded = jwt.verify(token, jwtSecret.secret);
        expect(decoded.id).toBe(userData._id);
        expect(decoded.username).toBe(userData.username);
    });

    test("should include expiration in generateJwtAccessToken function.", () => {
        const token = generateJwtAccessToken(userData, jwtSecret);
        const decoded = jwt.decode(token);
        expect(decoded.exp).toBeDefined();
    });

    test("should throw error with invalid secret by generateJwtAccessToken function.", () => {
        const badSecret = { secret: null, expireIn: "1h" };
        expect(() =>
            generateJwtAccessToken(userData, badSecret)
        ).toThrow();
    });

    test("should generate a valid refresh JWT token by generateJwtRefreshToken function.", () => {
        const token = generateJwtRefreshToken(userData._id, jwtSecret);
        expect(token).toBeDefined();
        expect(typeof token).toBe("string");
    });

    test("should contain correct payload in generateJwtRefreshToken function.", () => {
        const token = generateJwtRefreshToken(userData._id, jwtSecret);
        const decoded = jwt.verify(token, jwtSecret.refreshKey);
        expect(decoded.id).toBe(userData._id);
    });

    test("should include expiration in generateJwtRefreshToken function.", () => {
        const token = generateJwtRefreshToken(userData._id, jwtSecret);
        const decoded = jwt.decode(token);
        expect(decoded.exp).toBeDefined();
    });

    test("should throw error with invalid secret in generateJwtRefreshToken function.", () => {
        const badSecret = { refreshKey: null, expireIn: "7d" };
        expect(() =>
            generateJwtRefreshToken(userData._id, badSecret)
        ).toThrow();
    });

});