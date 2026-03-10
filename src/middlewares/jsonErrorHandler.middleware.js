export const jsonErrorHandler = (err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON format"
        });
    }
    next(err);
};