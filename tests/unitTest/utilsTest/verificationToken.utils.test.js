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

describe("Verification Token Test", () => {
    let verifyMethod;
    beforeEach(() => {
        verifyMethod = {
            usingLink: true,
            frontendBaseUrl: "http://localhost:3000"
        };
        jest.clearAllMocks();
    });

    test("should generate signup verification link", async () => {
        emailTokenGenerator.emailToken.mockReturnValue("mockedToken");
        const result = await verificationToken.saveSendToken(
            verifyMethod,
            {},
            1
        );
        expect(emailTokenGenerator.emailToken).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            saveToken: "mockedToken",
            sendToken:
                "http://localhost:3000/user/signup/link/verify-email?token=mockedToken"
        });
    });

    test("should generate reset-password verification link", async () => {
        emailTokenGenerator.emailToken.mockReturnValue("mockedToken");
        const result = await verificationToken.saveSendToken(
            verifyMethod,
            {},
            2
        );
        expect(result.sendToken).toBe(
            "http://localhost:3000/user/reset-password/link/verify-email?token=mockedToken"
        );
    });

    test("should generate delete-account verification link", async () => {
        emailTokenGenerator.emailToken.mockReturnValue("mockedToken");
        const result = await verificationToken.saveSendToken(
            verifyMethod,
            {},
            3
        );
        expect(result.sendToken).toBe(
            "http://localhost:3000/user/delete-account/link/verify-email?token=mockedToken"
        );
    });

    test("should generate OTP and hashed token", async () => {
        const verifyMethodOtp = {
            usingLink: false
        };
        const userSecretConfig = {
            bcryptSecret: "secret"
        };
        emailTokenGenerator.generateOtp.mockReturnValue("123456");
        emailTokenGenerator.hashOtp.mockResolvedValue("hashedOtp");
        const result = await verificationToken.saveSendToken(
            verifyMethodOtp,
            userSecretConfig,
            1
        );
        expect(emailTokenGenerator.generateOtp).toHaveBeenCalledTimes(1);
        expect(emailTokenGenerator.hashOtp).toHaveBeenCalledWith("123456", "secret");
        expect(result).toEqual({
            saveToken: "hashedOtp",
            sendToken: "123456"
        });
    });

    test("should fallback to delete-account if create value is invalid", async () => {
        emailTokenGenerator.emailToken.mockReturnValue("mockedToken");
        const result = await verificationToken.saveSendToken(
            verifyMethod,
            {},
            999
        );
        expect(result.sendToken).toBe(
            "http://localhost:3000/user/delete-account/link/verify-email?token=mockedToken"
        );
    });
});