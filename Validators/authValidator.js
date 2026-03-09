exports.authValidator = (req, res, next) => {
    const { role } = req.body
    if (role === 'student') {
        return res.status(403).json({ 
            success: false,
            message: "Forbidden: Students are not permitted to perform this action" 
        })
    }
    const allowedRoles = ['parent', 'mentor']
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ 
            success: false,
            message: "Invalid role. Only 'parent' or 'mentor' roles are permitted." 
        })
    }
    next()
};