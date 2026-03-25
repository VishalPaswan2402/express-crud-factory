import { describe, expect, test } from "@jest/globals";
import { emailTokenGenerator } from "../../../src/utils/emailTokenGenerator.utils.js";

describe("Email Token Generator Utility Test", () => {
    const bcryptSecret = { salts: 4 };

    test("for generate a 6-digit OTP", () => {
        const otp = emailTokenGenerator.generateOtp();
        expect(typeof otp).toBe("string");
        expect(otp).toHaveLength(6);
        expect(Number(otp)).toBeGreaterThanOrEqual(100000);
        expect(Number(otp)).toBeLessThanOrEqual(999999);
    });

    test("for hash OTP correctly", async () => {
        const otp = "123456";
        const hashed = await emailTokenGenerator.hashOtp(otp, bcryptSecret);
        expect(hashed).toBeDefined();
        expect(typeof hashed).toBe("string");
        expect(hashed).not.toBe(otp);
    });

    test("for validate correct OTP", async () => {
        const otp = "123456";
        const hashed = await emailTokenGenerator.hashOtp(otp, bcryptSecret);
        const isValid = await emailTokenGenerator.compareOtp(otp, hashed);
        expect(isValid).toBe(true);
    });

    test("for reject incorrect OTP", async () => {
        const otp = "123456";
        const wrongOtp = "654321";
        const hashed = await emailTokenGenerator.hashOtp(otp, bcryptSecret);
        const isValid = await emailTokenGenerator.compareOtp(wrongOtp, hashed);
        expect(isValid).toBe(false);
    });

    test("for generate a random email token", () => {
        const token1 = emailTokenGenerator.emailToken();
        const token2 = emailTokenGenerator.emailToken();
        expect(typeof token1).toBe("string");
        expect(token1).toHaveLength(64);
        expect(token1).not.toBe(token2);
    });

});