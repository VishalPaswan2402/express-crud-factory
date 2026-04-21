import { describe, expect, test } from "@jest/globals";
import { emailTokenGenerator } from "../../../src/utils/emailTokenGenerator.utils.js";

describe("Email Token Generator Utility Test", () => {
    const bcryptSecret = { salts: 4 };

    test("should validate correct email", () => {
        expect(emailTokenGenerator.validEmail("test@gmail.com")).toBe(true);
    });

    test("should reject invalid email", () => {
        expect(emailTokenGenerator.validEmail("invalid-email")).toBe(false);
        expect(emailTokenGenerator.validEmail("test@.com")).toBe(false);
        expect(emailTokenGenerator.validEmail("")).toBe(false);
    });

    test("should generate a 6-digit OTP", () => {
        const otp = emailTokenGenerator.generateOtp();
        expect(typeof otp).toBe("string");
        expect(otp).toHaveLength(6);
        expect(Number(otp)).toBeGreaterThanOrEqual(100000);
        expect(Number(otp)).toBeLessThanOrEqual(999999);
    });

    test("should hash OTP correctly", async () => {
        const otp = "123456";
        const hashed = await emailTokenGenerator.hashOtp(otp, bcryptSecret);
        expect(hashed).toBeDefined();
        expect(typeof hashed).toBe("string");
        expect(hashed).not.toBe(otp);
    });

    test("should validate correct OTP", async () => {
        const otp = "123456";
        const hashed = await emailTokenGenerator.hashOtp(otp, bcryptSecret);
        const isValid = await emailTokenGenerator.compareOtp(otp, hashed);
        expect(isValid).toBe(true);
    });

    test("should reject incorrect OTP", async () => {
        const otp = "123456";
        const wrongOtp = "654321";
        const hashed = await emailTokenGenerator.hashOtp(otp, bcryptSecret);
        const isValid = await emailTokenGenerator.compareOtp(wrongOtp, hashed);
        expect(isValid).toBe(false);
    });

    test("should return false for invalid hash", async () => {
        const isValid = await emailTokenGenerator.compareOtp("123456", "invalid-hash");
        expect(isValid).toBe(false);
    });

    test("should generate a random email token", () => {
        const token1 = emailTokenGenerator.emailToken();
        const token2 = emailTokenGenerator.emailToken();
        expect(typeof token1).toBe("string");
        expect(token1).toHaveLength(200);
        expect(token1).not.toBe(token2);
    });
});