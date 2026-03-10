const ErrorResponse = require('../../Utils/errorResponse')
const User = require("../../Models/User")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

exports.login = async (req, res, next) => {
    const { email, password } = req.body
    if (!email || !password) {
        return next(new ErrorResponse("Invalid Request Missing Parameters", 400))
    }
    const user = await User.findOne({ email })
    if (!user) {
        return next(new ErrorResponse("User not Found", 404))
    } else if (user.role === 'student') {
        return next(new ErrorResponse("Students cannot login directly", 403))
    } else {
        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) {
            return next(new ErrorResponse("Email or Password is Incorrect", 401))
        } else {
            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            )
            res.json({
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    role: user.role
                }
            })
        }
    }
}