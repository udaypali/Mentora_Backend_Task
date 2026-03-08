const User = require("../../Models/User")
const bcrypt = require("bcrypt")

exports.signup = async (req, res) => {
    try {
        const {name, email, password, role} = req.body
        if (!name || !email || !password || !role) {
            return res.status(400).json({message: "Invalid Request Missing Parameters"})
        }
        if (!["parent","mentor"].includes(role)) {
            return res.status(403).json({message: "Forbidden only Parents and Mentors can Sign-Up"})
        }
        const existingUser = await User.findOne({email})
        if (existingUser) {
            return res.status(400).json({message: "Users Already Exists"})
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
    } catch (err) {
        console.log(err)
        return res.status(500).json({message: "Server error"})
    }
}