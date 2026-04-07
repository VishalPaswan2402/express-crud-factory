export const successResponse = (response, statusCode = 200, data = null, message = "success") => {
    return response.status(statusCode).json({
        data: data,
        message: message,
        success: true
    });
};

export const loginResponse = (response, statusCode = 200, data = null, token = null, message = "success") => {
    return response.status(statusCode).json({
        data: data,
        token: token,
        message: message,
        success: true
    });
};

export const errorResponse = (response, statusCode, message = "Something went wrong.") => {
    return response.status(statusCode).json({
        message: message,
        success: false
    });
};
