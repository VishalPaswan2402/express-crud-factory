export const dataExpiryTime = {
    otpLinkExpire: (minuteTime) => {
        const expiryOtp = new Date(Date.now() + minuteTime * 60 * 1000);
        return expiryOtp;
    },
    userDataExpire: (dayTime) => {
        const expiryData = new Date(Date.now() + dayTime * 24 * 60 * 60 * 1000);
        return expiryData;
    }
}