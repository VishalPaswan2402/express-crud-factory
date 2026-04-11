import { jest, describe, test, expect, beforeEach, beforeAll } from "@jest/globals";

jest.unstable_mockModule("../../../src/utils/emailTokenGenerator.utils.js", () => ({
    emailTokenGenerator: {
        emailToken: jest.fn(),
        generateOtp: jest.fn(),
        hashOtp: jest.fn(),
        emailEncryptToken: jest.fn()
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

describe("Verification Token Test", () => {
    let emailTokenConfig, verifyMethod;
    beforeEach(() => {
        verifyMethod = {
            usingLink: true,
            frontendBaseUrl: "http://localhost:3000"
        };
        emailTokenConfig = {
            emailTokenSecret: {
                secret: "123",
                expireIn: "2m"
            }
        };
        jest.clearAllMocks();
    });

    test("should generate signup verification link", async () => {
        emailTokenGenerator.emailEncryptToken.mockReturnValue("mockedToken");
        const result = await verificationToken.saveSendToken(
            verifyMethod,
            {},
            emailTokenConfig,
            1,
            "abc@gmail.com"
        );
        expect(emailTokenGenerator.emailEncryptToken).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            saveToken: "mockedToken",
            sendToken: "http://localhost:3000/user/signup/link/verify-email?token=mockedToken"
        });
    });

    test("should generate recover verification link", async () => {
        emailTokenGenerator.emailEncryptToken.mockReturnValue("mockedToken");
        const result = await verificationToken.saveSendToken(
            verifyMethod,
            {},
            emailTokenConfig,
            2,
            "abc@gmail.com"
        );
        expect(result.sendToken).toBe(
            "http://localhost:3000/user/reset-password/link/verify-email?token=mockedToken"
        );
    });

    test("should generate destroy verification link", async () => {
        emailTokenGenerator.emailEncryptToken.mockReturnValue("mockedToken");
        const result = await verificationToken.saveSendToken(
            verifyMethod,
            {},
            emailTokenConfig,
            3,
            "abc@gmail.com"
        );
        expect(result.sendToken).toBe(
            "http://localhost:3000/user/delete-account/link/verify-email?token=mockedToken"
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
            {},
            1,
            "abc@gmail.com"
        );
        expect(emailTokenGenerator.generateOtp).toHaveBeenCalledTimes(1);
        expect(emailTokenGenerator.hashOtp).toHaveBeenCalledWith("123456", "secret");
        expect(result).toEqual({
            saveToken: "hashedOtp",
            sendToken: "123456"
        });
    });

    test("should fallback to destroy if create value is invalid", async () => {
        emailTokenGenerator.emailEncryptToken.mockReturnValue("mockedToken");
        const result = await verificationToken.saveSendToken(
            verifyMethod,
            {},
            emailTokenConfig,
            999,
            "abc@gmail.com"
        );
        expect(result.sendToken).toBe(
            "http://localhost:3000/user/delete-account/link/verify-email?token=mockedToken"
        );
    });

});