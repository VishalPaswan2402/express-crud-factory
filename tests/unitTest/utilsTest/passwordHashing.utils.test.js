import { describe, expect, test } from "@jest/globals";
import { passwordHashing } from "../../../src/utils/passwordHashing.utils.js";

describe("Password Hashing Utility Test", () => {
    const bcryptSecret = {
        salts: 10
    };

    test("should hash password correctly", async () => {
        const password = "myPassword123";
        const hashed = await passwordHashing.hashPassword(password, bcryptSecret);
        expect(hashed).toBeDefined();
        expect(hashed).not.toBe(password);
        expect(typeof hashed).toBe("string");
    });

    test("should compare password correctly (valid case)", async () => {
        const password = "myPassword123";
        const hashed = await passwordHashing.hashPassword(password, bcryptSecret);
        const isMatch = await passwordHashing.comparePassword(password, hashed);
        expect(isMatch).toBe(true);
    });

    test("should compare password correctly (invalid case)", async () => {
        const password = "myPassword123";
        const wrongPassword = "wrongPassword";
        const hashed = await passwordHashing.hashPassword(password, bcryptSecret);
        const isMatch = await passwordHashing.comparePassword(wrongPassword, hashed);
        expect(isMatch).toBe(false);
    });

});