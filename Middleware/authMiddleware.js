const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    // checks for token in the payload
    const token = req.headers.authorization;
    // token not found then 401 unauthorised else decode the jwt using the secret in the env and use next to send to the next middleware
    if (!token) {
      return res.status(401).json({message: "No token provided"});
    } else {
        try {
            const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (err) {
          console.log(err)
          return res.status(401).json({message: "Invalid token"});
        }
    }
  };
  
module.exports = authMiddleware;