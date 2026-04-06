import { jest, describe, test, expect, beforeEach, beforeAll } from "@jest/globals";

jest.unstable_mockModule("../../../src/utils/emailTokenGenerator.utils.js", () => ({
    emailTokenGenerator: {
        emailToken: jest.fn(),
        generateOtp: jest.fn(),
        hashOtp: jest.fn()
    }
}));

let verificationToken;
let emailTokenGenerator;

beforeAll(async () => {
    emailTokenGenerator = (await import(
        "../../../src/utils/emailTokenGenerator.utils.js"
    )).emailTokenGenerator;

    verificationToken = (await import(
        "../../../src/utils/verificationToken.utils.js"
    )).verificationToken;
});

describe("Verification Token Snapshot Test", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should generate signup verification link", async () => {
        const verifyMethod = {
            usingLink: true,
            frontendBaseUrl: "http://localhost:3000"
        };
        emailTokenGenerator.emailToken.mockReturnValue("mockedToken");
        const result = await verificationToken.saveSendToken(
            verifyMethod,
            {},
            1,
            "1234"
        );
        expect(emailTokenGenerator.emailToken).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            saveToken: "mockedToken",
            sendToken: "http://localhost:3000/user/signup/1234/verify-email?token=mockedToken"
        });
    });

    test("should generate recover verification link", async () => {
        const verifyMethod = {
            usingLink: true,
            frontendBaseUrl: "http://localhost:3000"
        };
        emailTokenGenerator.emailToken.mockReturnValue("mockedToken");
        const result = await verificationToken.saveSendToken(
            verifyMethod,
            {},
            2,
            "5678"
        );
        expect(result.sendToken).toBe(
            "http://localhost:3000/user/recover/5678/verify-email?token=mockedToken"
        );
    });

    test("should generate destroy verification link", async () => {
        const verifyMethod = {
            usingLink: true,
            frontendBaseUrl: "http://localhost:3000"
        };
        emailTokenGenerator.emailToken.mockReturnValue("mockedToken");
        const result = await verificationToken.saveSendToken(
            verifyMethod,
            {},
            3,
            "9999"
        );
        expect(result.sendToken).toBe(
            "http://localhost:3000/user/destroy/9999/verify-email?token=mockedToken"
        );
    });

    test("should generate OTP and hashed token", async () => {
        const verifyMethod = {
            usingLink: false
        };
        const userSecretConfig = {
            bcryptSecret: "secret"
        };
        emailTokenGenerator.generateOtp.mockReturnValue("123456");
        emailTokenGenerator.hashOtp.mockResolvedValue("hashedOtp");
        const result = await verificationToken.saveSendToken(
            verifyMethod,
            userSecretConfig,
            1,
            "1234"
        );
        expect(emailTokenGenerator.generateOtp).toHaveBeenCalledTimes(1);
        expect(emailTokenGenerator.hashOtp).toHaveBeenCalledWith("123456", "secret");
        expect(result).toEqual({
            saveToken: "hashedOtp",
            sendToken: "123456"
        });
    });

    test("should fallback to destroy if create value is invalid", async () => {
        const verifyMethod = {
            usingLink: true,
            frontendBaseUrl: "http://localhost:3000"
        };
        emailTokenGenerator.emailToken.mockReturnValue("mockedToken");
        const result = await verificationToken.saveSendToken(
            verifyMethod,
            {},
            999,
            "1111"
        );
        expect(result.sendToken).toContain("/destroy/1111/");
    });

});