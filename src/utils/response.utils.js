export const successResponse = (response, statusCode = 200, data = null, message = "success") => {
    return response.status(statusCode).json({
        data: data,
        message: message,
        success: true
    });
};

export const loginResponse = (response, statusCode = 200, data = null, token = null, refreshToken = null, message = "success") => {
    const options = {
        httpOnly: true,
        secure: true
    };
    return response
        .status(statusCode)
        .cookie("accessToken", token, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
            data: data,
            accessToken: token,
            refreshToken: refreshToken,
            message: message,
            success: true
        });
};

export const errorResponse = (response, statusCode = 500, message = "Something went wrong.") => {
    return response.status(statusCode).json({
        message: message,
        success: false
    });
};

export const checkUserResponse = (response, statusCode = 200, message = "success") => {
    return response.status(statusCode).json({
        message: message,
        success: true
    });
};
