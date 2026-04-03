import { jest, describe, test, expect, beforeEach, beforeAll } from "@jest/globals";

/* 🔥 MOCK emailTokenGenerator */
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

describe("verificationToken.saveSendToken (without snapshot)", () => {
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
            true,  // create
            null
        );
        expect(emailTokenGenerator.emailToken).toHaveBeenCalled();
        expect(result.saveToken).toBe("mockedToken");
        expect(result.sendToken).toBe(
            "http://localhost:3000/user/signup/verify-email?token=mockedToken"
        );
    });

    test("should generate destroy verification link with userId", async () => {
        const verifyMethod = {
            usingLink: true,
            frontendBaseUrl: "http://localhost:3000"
        };
        emailTokenGenerator.emailToken.mockReturnValue("mockedToken");
        const result = await verificationToken.saveSendToken(
            verifyMethod,
            {},
            false,   // destroy flow
            "123"
        );
        expect(emailTokenGenerator.emailToken).toHaveBeenCalled();
        expect(result.saveToken).toBe("mockedToken");
        expect(result.sendToken).toBe(
            "http://localhost:3000/user/destroy/123/verify-email?token=mockedToken"
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
            true,
            null
        );
        expect(emailTokenGenerator.generateOtp).toHaveBeenCalled();
        expect(emailTokenGenerator.hashOtp)
            .toHaveBeenCalledWith("123456", "secret");
        expect(result.saveToken).toBe("hashedOtp");
        expect(result.sendToken).toBe("123456");
    });
});