export const validEmailRequest = (user) => {
    const twoHours = 2 * 60 * 60 * 1000;
    if (user.otpRequestCount >= 3) {
        if ((Date.now() - user.otpLastRequest.getTime()) < twoHours) {
            return false;
        }
        else {
            user.otpRequestCount = 0;
            user.otpLastRequest = null;
            return true;
        }
    }
    return true;
};