const ErrorResponse = require('../../Utils/errorResponse')
const User = require("../../Models/User")
const bcrypt = require("bcrypt")


exports.signup = async (req, res, next) => {
    const {name, email, password, role} = req.body
    if (!name || !email || !password || !role) {
        return next(new ErrorResponse("Invalid Request Missing Parameters",400))
    }
    const existingUser = await User.findOne({email})
    if (existingUser) {
        return next(new ErrorResponse("User Already Exists",400))
    } else {
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        })
        res.status(201).json({
            message: "User created",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    }
}