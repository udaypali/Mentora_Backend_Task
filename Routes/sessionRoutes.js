const express = require('express')
const router = express.Router()

const sessionController = require("../Controllers/sessionController")
const authMiddleware = require("../Middleware/authMiddleware")
const roleMiddleware = require("../Middleware/roleMiddleware")
const {inputValidator, Schema} = require("../Validators/inputValidator")

router.post('/sessions', authMiddleware, inputValidator(Schema.session), roleMiddleware(['mentor']), sessionController.session)
router.post('/sessions/:sessionId/join', authMiddleware, inputValidator(Schema.joinSession), roleMiddleware(['parent']), sessionController.joinSession)
router.delete('/sessions/:sessionId', authMiddleware, inputValidator(Schema.deleteSession), roleMiddleware(['mentor']), sessionController.deleteSession)
router.put('/sessions/:sessionId', authMiddleware, inputValidator(Schema.updateSession), roleMiddleware(['mentor']), sessionController.updateSession)
router.get('/lessons/:lessonId/sessions', authMiddleware, inputValidator(Schema.getSession), roleMiddleware(['mentor']), sessionController.getSession)

module.exports = router