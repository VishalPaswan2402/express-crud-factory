import { jest, describe, test, expect, beforeEach, beforeAll } from "@jest/globals";

jest.unstable_mockModule("../../../src/utils/verifyEmailBodyTemplate.utils.js", () => ({
    getVerificationEmailTemplate: jest.fn()
}));

jest.unstable_mockModule("../../../src/utils/verifyOtpBodyTemplate.utils.js", () => ({
    getOtpVerificationEmailTemplate: jest.fn()
}));

let verificationMailSender;
let getVerificationEmailTemplate;
let getOtpVerificationEmailTemplate;

beforeAll(async () => {
    getVerificationEmailTemplate = (await import(
        "../../../src/utils/verifyEmailBodyTemplate.utils.js"
    )).getVerificationEmailTemplate;

    getOtpVerificationEmailTemplate = (await import(
        "../../../src/utils/verifyOtpBodyTemplate.utils.js"
    )).getOtpVerificationEmailTemplate;

    verificationMailSender = (await import(
        "../../../src/utils/verificationMailSender.utils.js"
    )).verificationMailSender;
});

describe("Verification Mail Sender Snapshot Test", () => {
    let emailSender;
    beforeEach(() => {
        emailSender = {
            sendMail: jest.fn().mockResolvedValue(true),
            options: {
                auth: {
                    user: "test@gmail.com"
                }
            }
        };
        jest.clearAllMocks();
    });

    test("for send verification LINK email (signup)", async () => {
        const verifyMethod = {
            usingLink: true,
            otpLinkExpiryMinutes: 10,
            projectName: "MyApp"
        };
        getVerificationEmailTemplate.mockReturnValue("<h1>Link Template</h1>");
        await verificationMailSender.sendEmail(
            emailSender,
            verifyMethod,
            "user@gmail.com",
            1,
            "Vishal",
            "http://link"
        );
        expect(getVerificationEmailTemplate).toHaveBeenCalledWith(
            "http://link",
            10,
            1,
            "Vishal",
            "MyApp"
        );
        expect(emailSender.sendMail).toHaveBeenCalledTimes(1);
        expect(emailSender.sendMail).toHaveBeenCalledWith({
            from: "MyApp <test@gmail.com>",
            to: "user@gmail.com",
            subject: "Account activation mail.",
            text: "Link to activate your account : http://link",
            html: "<h1>Link Template</h1>"
        });
    });

    test("for send verification LINK email (recover)", async () => {
        const verifyMethod = {
            usingLink: true,
            otpLinkExpiryMinutes: 10,
            projectName: "MyApp"
        };
        getVerificationEmailTemplate.mockReturnValue("<h1>Recover Link</h1>");
        await verificationMailSender.sendEmail(
            emailSender,
            verifyMethod,
            "user@gmail.com",
            2,
            "Vishal",
            "http://link"
        );
        expect(emailSender.sendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                subject: "Account recovery mail.",
                text: "Link to recover your account : http://link"
            })
        );
    });

    test("for send verification LINK email (deactivation)", async () => {
        const verifyMethod = {
            usingLink: true,
            otpLinkExpiryMinutes: 10,
            projectName: "MyApp"
        };
        getVerificationEmailTemplate.mockReturnValue("<h1>Deactivate Link</h1>");
        await verificationMailSender.sendEmail(
            emailSender,
            verifyMethod,
            "user@gmail.com",
            3,
            "Vishal",
            "http://link"
        );
        expect(emailSender.sendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                subject: "Account deactivation mail.",
                text: "Link to deactivate your account : http://link"
            })
        );
    });

    test("for send OTP email", async () => {
        const verifyMethod = {
            usingLink: false,
            otpLinkExpiryMinutes: 10,
            projectName: "MyApp"
        };
        getOtpVerificationEmailTemplate.mockReturnValue("<h1>OTP Template</h1>");
        await verificationMailSender.sendEmail(
            emailSender,
            verifyMethod,
            "user@gmail.com",
            1,
            "Vishal",
            "123456"
        );
        expect(getOtpVerificationEmailTemplate).toHaveBeenCalledWith(
            "123456",
            10,
            1,
            "Vishal",
            "MyApp"
        );
        expect(emailSender.sendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                text: "OTP to activate your account : 123456",
                html: "<h1>OTP Template</h1>"
            })
        );
    });

    test("for throw error if sendMail fails", async () => {
        emailSender.sendMail.mockRejectedValue(new Error("Mail failed"));
        const verifyMethod = {
            usingLink: true,
            otpLinkExpiryMinutes: 10,
            projectName: "MyApp"
        };
        getVerificationEmailTemplate.mockReturnValue("<h1>Link</h1>");
        await expect(
            verificationMailSender.sendEmail(
                emailSender,
                verifyMethod,
                "user@gmail.com",
                1,
                "Vishal",
                "http://link"
            )
        ).rejects.toThrow("Mail failed");
    });

    test("for fallback to deactivation for invalid create value", async () => {
        const verifyMethod = {
            usingLink: true,
            otpLinkExpiryMinutes: 10,
            projectName: "MyApp"
        };
        getVerificationEmailTemplate.mockReturnValue("<h1>Fallback</h1>");
        await verificationMailSender.sendEmail(
            emailSender,
            verifyMethod,
            "user@gmail.com",
            999,
            "Vishal",
            "http://link"
        );
        expect(emailSender.sendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                subject: "Account deactivation mail."
            })
        );
    });
});