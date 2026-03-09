const express = require('express')
const router = express.Router()

const lessonController = require("../Controllers/lessonController")
const authMiddleware = require("../Middleware/authMiddleware")
const roleMiddleware = require("../Middleware/roleMiddleware")

router.post('/lessons', authMiddleware, roleMiddleware(['mentor']), lessonController.createlesson)

module.exports = router