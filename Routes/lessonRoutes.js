const express = require('express')
const router = express.Router()

const lessonController = require("../Controllers/lessonController")
const authMiddleware = require("../Middleware/authMiddleware")
const roleMiddleware = require("../Middleware/roleMiddleware")
const {inputValidator, Schema} = require("../Validators/inputValidator")

router.post('/lessons', authMiddleware, inputValidator(Schema.lesson), roleMiddleware(['mentor']), lessonController.lesson)
router.delete('/lessons/:lessonId', authMiddleware, inputValidator(Schema.deleteLesson), roleMiddleware(['mentor']), lessonController.deleteLesson)
router.put('/lessons/:lessonId', authMiddleware, inputValidator(Schema.updateLesson), roleMiddleware(['mentor']), lessonController.updateLesson)
router.get('/lessons/:lessonId', authMiddleware, inputValidator(Schema.getLesson), lessonController.getLesson)
router.get('/lessons', authMiddleware, lessonController.getAllLesson)

module.exports = router