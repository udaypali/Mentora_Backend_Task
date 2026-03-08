const express = require('express')
const router = express.Router()

const authController = require("../Controllers/auth/authController")
const authMiddleware = require("../Middleware/authMiddleware")

router.post('/signup', authController.signup)
router.post("/login", authController.login)
router.get("/me", authMiddleware, authController.profile)

module.exports = router