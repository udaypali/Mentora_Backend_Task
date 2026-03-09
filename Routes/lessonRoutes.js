const express = require('express')
const router = express.Router()

const lessonController = require("../Controllers/lessonController")
const authMiddleware = require("../Middleware/authMiddleware")
const roleMiddleware = require("../Middleware/roleMiddleware")
const {inputValidator, Schema} = require("../Validators/inputValidator")

router.post('/lessons', authMiddleware, inputValidator(Schema.lesson), roleMiddleware(['mentor']), lessonController.createlesson)

module.exports = router