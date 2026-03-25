import { describe, expect, test } from "@jest/globals";
import { dataExpiryTime } from "../../../src/utils/dataExpiryTime.utils.js";

describe("Data Expiry Time Utility Test", () => {
    test("for otpLinkExpire should return correct future time in minutes", () => {
        const minutes = 5;
        const before = Date.now();
        const result = dataExpiryTime.otpLinkExpire(minutes);
        const after = Date.now();
        expect(result).toBeInstanceOf(Date);
        const expectedMin = before + minutes * 60 * 1000;
        const expectedMax = after + minutes * 60 * 1000;
        expect(result.getTime()).toBeGreaterThanOrEqual(expectedMin);
        expect(result.getTime()).toBeLessThanOrEqual(expectedMax);
    });

    test("for userDataExpire should return correct future time in days", () => {
        const days = 2;
        const before = Date.now();
        const result = dataExpiryTime.userDataExpire(days);
        const after = Date.now();
        expect(result).toBeInstanceOf(Date);
        const expectedMin = before + days * 24 * 60 * 60 * 1000;
        const expectedMax = after + days * 24 * 60 * 60 * 1000;
        expect(result.getTime()).toBeGreaterThanOrEqual(expectedMin);
        expect(result.getTime()).toBeLessThanOrEqual(expectedMax);
    });

    test("for handle 0 value correctly", () => {
        const result = dataExpiryTime.otpLinkExpire(0);
        expect(result).toBeInstanceOf(Date);
        const diff = result.getTime() - Date.now();
        expect(diff).toBeLessThan(1000);
    });

});