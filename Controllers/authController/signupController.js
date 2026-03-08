exports.signup = async (req, res) => {
    try {
        // get the data from the request body
        const {name, email, password, role} = req.body
        // return 400 bad request if any of the parameters are missing
        if (!name || !email || !password || !role) {
            return res.status(400).json({message: "Invalid Request Missing Parameters"})
        }
        // return 403 forbidden if role doesnt match any of the roles in the list
        if (!["parent","teacher"].include(role)) {
            return res.status(403).json({message: "Forbidden only Parent and Teacher can Sign-Up"})
        }
        // check if user already exsits in the database
        const existingUser = await User.findOne({email})
        // if user exists send a 400 bad request 
        if (existingUser) {
            return res.status(400).json({message: "Users Already Exists"})
        } else {
            // if user does not exist hash the passsword and create the user
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
        return res.status(500).json({message: "Server error"})
    }
}