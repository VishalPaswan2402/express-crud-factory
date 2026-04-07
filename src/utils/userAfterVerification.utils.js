export const userAfterVerification = async (user) => {
    // update user
    user.emailVerified = true;
    user.isActive = true;
    user.verifyToken = null;
    user.verifyTokenExpires = null;
    user.destroyDataAfter = null;
    user.otpRequestCount = 0;
    user.otpLastRequest = null;
    const data = await user.save();
    // make response data
    const savedData = data.toObject();
    delete savedData.password;
    delete savedData.verifyToken;
    delete savedData.verifyTokenExpires;
    delete savedData.destroyDataAfter;
    delete savedData.otpRequestCount;
    delete savedData.otpLastRequest;
    savedData.articles = savedData.articles.length;
    return savedData;
}