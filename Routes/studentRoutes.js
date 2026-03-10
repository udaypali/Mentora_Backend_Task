const express = require('express')
const router = express.Router()

const studentController = require("../Controllers/studentController")
const authMiddleware = require("../Middleware/authMiddleware")
const roleMiddleware = require("../Middleware/roleMiddleware")
const {inputValidator, Schema} = require("../Validators/inputValidator")

router.post('/students', authMiddleware, inputValidator(Schema.student), roleMiddleware(['parent']), studentController.createStudent)
router.delete('/students/:studentId', authMiddleware, inputValidator(Schema.deleteStudent), roleMiddleware(['parent']), studentController.deleteStudent)
router.put('/students/:studentId', authMiddleware, inputValidator(Schema.updateStudent), roleMiddleware(['parent']), studentController.updateStudent)
router.get("/students", authMiddleware, roleMiddleware(['mentor','parent']), studentController.getStudent)

module.exports = router