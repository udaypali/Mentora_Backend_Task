const User = require("../../Models/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

exports.login = async (req,res) => {
    try {
        const {email, password} = req.body
        if (!email || !password) {
            return res.status(400).json({message: "Invalid Request Missing Parameters"})
        }
        const user = await User.findOne({email})
        if (!user) {
            return res.status(400).json({message: 'User Does not Exist'})
        } else {
           const validPassword = await bcrypt.compare(password, user.password)
           if (!validPassword) {
                return res.status(401).json({message: 'Email or Password is incorrect'})
           } else {
                const token = jwt.sign(
                    {id: user._id, role: user.role},
                    process.env.JWT_SECRET,
                    {expiresIn: "1d"}
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
    } catch (err) {
        console.log(err)
        return res.status(500).json({message: "Server error"})
    }
}