const express = require('express')
const router = express.Router()

const lessonController = require("../Controllers/lessonController")
const authMiddleware = require("../Middleware/authMiddleware")

router.post('/lessons', authMiddleware, lessonController.createlesson)

module.exports = router