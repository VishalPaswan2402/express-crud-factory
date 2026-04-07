import { jest, describe, test, expect, beforeEach, afterEach, beforeAll } from "@jest/globals";

jest.unstable_mockModule("../../../src/utils/verificationToken.utils.js", () => ({
    verificationToken: {
        saveSendToken: jest.fn(async () => ({
            saveToken: "mocked-save-token",
            sendToken: "mocked-send-token"
        }))
    }
}));

jest.unstable_mockModule("../../../src/utils/verificationMailSender.utils.js", () => ({
    verificationMailSender: {
        sendEmail: jest.fn(async () => true)
    }
}));

jest.unstable_mockModule("../../../src/utils/dataExpiryTime.utils.js", () => ({
    dataExpiryTime: {
        otpLinkExpire: jest.fn(() => Date.now() + 10000),
        userDataExpire: jest.fn(() => Date.now() + 20000)
    }
}));

jest.unstable_mockModule("../../../src/utils/passwordHashing.utils.js", () => ({
    passwordHashing: {
        hashPassword: jest.fn(async () => "hashedPassword"),
        securePassword: jest.fn((pwd) => true)
    }
}));

jest.unstable_mockModule("../../../src/utils/emailTokenGenerator.utils.js",()=>({
    emailTokenGenerator:{
        validEmail: jest.fn((eml) => true)
    }
}))

let verificationToken;
let verificationMailSender;
let createUserController;
let passwordHashing;
let emailTokenGenerator;

beforeAll(async () => {
    verificationToken = (await import(
        "../../../src/utils/verificationToken.utils.js"
    )).verificationToken;

    verificationMailSender = (await import(
        "../../../src/utils/verificationMailSender.utils.js"
    )).verificationMailSender;

    createUserController = (await import(
        "../../../src/controllers/userControllers/createUser.controller.js"
    )).default;

    passwordHashing = (await import(
        "../../../src/utils/passwordHashing.utils.js"
    )).passwordHashing;

    emailTokenGenerator = (await import(
        "../../../src/utils/emailTokenGenerator.utils.js"
    )).emailTokenGenerator;
});

describe("Create User Controller Snapshot Test", () => {
    let req, res, Model;
    const verifyMethod = {
        usingLink: true,
        frontendBaseUrl: "http://localhost:3000",
        otpLinkExpiryMinutes: 10,
        unverifiedUserExpiryDays: 1
    };
    const userSecretConfig = {
        bcryptSecret: "secret"
    };
    const emailSender = {};
    const mockFindOne = (data) => ({
        select: jest.fn().mockResolvedValue(data)
    });
    const sanitizeResponse = (res) => {
        const body = { ...res.json.mock.calls[0][0] };
        if (body?.data?._id) body.data._id = "mocked-id";
        if (body?.data?.userId) body.data.userId = "mocked-user-id";
        return {
            status: res.status.mock.calls[0][0],
            body
        };
    };
    beforeEach(() => {
        req = {
            body: {
                email: "test@gmail.com",
                username: "test",
                fullname: "UserTest",
                password: "testPassword",
                confirmPassword: "testPassword"
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        Model = {
            findOne: jest.fn(),
            findByIdAndDelete: jest.fn()
        };
        jest.clearAllMocks();
        passwordHashing.securePassword.mockReturnValue(true);
        emailTokenGenerator.validEmail.mockReturnValue(true);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("for missing fields.", async () => {
        req.body.username = "";
        const controller = createUserController(
            Model,
            userSecretConfig,
            emailSender,
            verifyMethod
        );
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for invalid email", async () => {
        req.body.email = "validgmail.com";
        emailTokenGenerator.validEmail.mockReturnValue(false);
        const controller = createUserController(
            Model,
            userSecretConfig,
            emailSender,
            verifyMethod
        );
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for weak password", async () => {
        req.body.password = "weak";
        req.body.confirmPassword = "weak";
        passwordHashing.securePassword.mockReturnValue(false);
        const controller = createUserController(
            Model,
            userSecretConfig,
            emailSender,
            verifyMethod
        );
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for password mismatch.", async () => {
        req.body.confirmPassword = "wrong";
        const controller = createUserController(
            Model,
            userSecretConfig,
            emailSender,
            verifyMethod
        );
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for user already exists.", async () => {
        Model.findOne.mockReturnValue(
            mockFindOne({ emailVerified: true })
        );
        const controller = createUserController(
            Model,
            userSecretConfig,
            emailSender,
            verifyMethod
        );
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for delete expired unverified user and create new.", async () => {
        Model.findOne.mockReturnValue(
            mockFindOne({
                _id: "123",
                emailVerified: false,
                destroyDataAfter: Date.now() - 1000
            })
        );
        Model.findByIdAndDelete.mockResolvedValue(true);
        const mockSave = jest.fn();
        const mockDoc = {
            _id: "userId",
            email: req.body.email,
            fullname: req.body.fullname,
            save: mockSave
        };
        mockSave
            .mockResolvedValueOnce(mockDoc) // first save
            .mockResolvedValueOnce(mockDoc); // second save
        const MockModel = jest.fn(() => mockDoc);
        MockModel.findOne = Model.findOne;
        MockModel.findByIdAndDelete = Model.findByIdAndDelete;
        const controller = createUserController(
            MockModel,
            userSecretConfig,
            emailSender,
            verifyMethod
        );
        await controller(req, res);
        expect(Model.findByIdAndDelete).toHaveBeenCalledWith("123");
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for successful user creation.", async () => {
        Model.findOne.mockReturnValue(mockFindOne(null));
        const mockSave = jest.fn();
        const mockDoc = {
            _id: "userId",
            email: req.body.email,
            fullname: req.body.fullname,
            save: mockSave
        };
        mockSave
            .mockResolvedValueOnce(mockDoc)
            .mockResolvedValueOnce(mockDoc);
        const MockModel = jest.fn(() => mockDoc);
        MockModel.findOne = Model.findOne;
        const controller = createUserController(
            MockModel,
            userSecretConfig,
            emailSender,
            verifyMethod
        );
        await controller(req, res);
        expect(verificationToken.saveSendToken).toHaveBeenCalled();
        expect(verificationMailSender.sendEmail).toHaveBeenCalled();
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });

    test("for database error.", async () => {
        Model.findOne.mockReturnValue({
            select: jest.fn().mockRejectedValue(new Error("DB error"))
        });
        const controller = createUserController(
            Model,
            userSecretConfig,
            emailSender,
            verifyMethod
        );
        await controller(req, res);
        expect(sanitizeResponse(res)).toMatchSnapshot();
    });
});