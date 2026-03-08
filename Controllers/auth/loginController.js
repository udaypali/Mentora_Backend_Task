const User = require("../../Models/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

exports.login = async (req,res) => {
    try {
        // get the data from the request body
        const {email, password} = req.body
        // return 400 bad request if any of the parameters are missing
        if (!email || !password) {
            return res.status(400).json({message: "Invalid Request Missing Parameters"})
        }
        // check if the account exists or not
        const user = await User.findOne({email})
        if (!user) {
            return res.status(400).json({message: 'User Does not Exist'})
        } else {
            // compare the password from the database and password form the user if not correct send status 401 unauthorised
           const validPassword = await bcrypt.compare(password, user.password)
           if (!validPassword) {
                return res.status(401).json({message: 'Email or Password is incorrect'})
           } else {
                // create a jwt token with user id and user role as body
                const token = jwt.sign(
                    {id: user._id, role: user.role},
                    process.env.JWT_SECRET,
                    {expiresIn: "1d"}
                )
                // send the response to user with token and user details
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