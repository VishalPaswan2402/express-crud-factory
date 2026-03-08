export const authorizeUser = (req, res, next) => {
    try {
        const { userId } = req.params;
        const loggedId = req.loggedUser.id;
        if (loggedId != userId) {
            return res.status(403).json({
                message: "Access denied for this.",
                success: false
            });
        }
        next();
    }
    catch (error) {
        return res.status(401).json({
            message: "Unauthorized user.",
            success: false
        });
    }
};