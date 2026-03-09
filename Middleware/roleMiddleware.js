const roleMiddleware = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Not Authorised to do this Action" })
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Access denied. Role '${req.user.role}' is not authorized for this action.` 
            })
        }
        next()
    }
}

module.exports = roleMiddleware