import jwt from "jsonwebtoken";
import { errorResponse, loginResponse, successResponse } from "../../utils/response.utils.js";
import { generateJwtAccessToken, generateJwtRefreshToken } from "../../utils/generateJwtToken.utils.js";

const refreshTokenController = (UserModel, userSecretConfig) => async (req, res) => {
    try {
        const { userId } = req.params;
        let token = null;
        if (req.cookies?.refreshToken) {
            token = req.cookies.refreshToken;
        }
        else if (req.body?.refreshToken) {
            token = req.body.refreshToken;
        }
        if (!token) {
            return errorResponse(res, 401, "Authentication token is missing.");
        }
        const decodedToken = jwt.verify(
            token,
            userSecretConfig.jwtSecret.refreshKey,
            {
                algorithms: ["HS256"]
            }
        );
        if (decodedToken.id !== userId) {
            return errorResponse(res, 401, "Unauthorized user.");
        }
        const userExist = await UserModel.findById(userId).select("+jwtRefreshToken");
        if (!userExist) {
            return errorResponse(res, 404, "User not found.");
        }
        if (userExist.jwtRefreshToken !== token) {
            return errorResponse(res, 401, "Invalid refresh token.");
        }
        const accessToken = generateJwtAccessToken(userExist, userSecretConfig.jwtSecret);
        const newRefreshToken = generateJwtRefreshToken(userId, userSecretConfig.jwtSecret);
        userExist.jwtRefreshToken = newRefreshToken;
        await userExist.save();
        return loginResponse(res, 200, null, accessToken, newRefreshToken, "Access token refreshed successfully.");
    }
    catch (error) {
        return errorResponse(res, 500, "Something went wrong. Please try again later.");
    }
}

export default refreshTokenController;