const express = require('express')
const router = express.Router()

const studentController = require("../Controllers/studentController")
const authMiddleware = require("../Middleware/authMiddleware")

router.post('/students', authMiddleware, studentController.createStudent)
router.get("/students", authMiddleware, studentController.getStudent)

module.exports = router