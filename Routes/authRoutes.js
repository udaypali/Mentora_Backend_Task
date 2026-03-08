const express = require('express')
const router = express.Router()

const authController = require("../Controllers/auth/authController")
const authMiddleware = require("../Middleware/authMiddleware")

router.post('/auth/signup', authController.signup)
router.post("/auth/login", authController.login)
router.get("/me", authMiddleware, authController.profile)

module.exports = router