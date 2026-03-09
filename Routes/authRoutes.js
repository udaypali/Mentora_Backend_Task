const express = require('express')
const router = express.Router()

const authController = require("../Controllers/auth/authController")
const authMiddleware = require("../Middleware/authMiddleware")
const roleMiddleware = require("../Middleware/roleMiddleware")
const {authValidator} = require("../Validators/authValidator")
const {inputValidator, Schema} = require("../Validators/inputValidator")

router.post('/auth/signup', authValidator, inputValidator(Schema.signup), authController.signup)
router.post("/auth/login", inputValidator(Schema.login), authController.login)
router.get("/me", authMiddleware, roleMiddleware(['mentor','parent']), authController.profile)

module.exports = router