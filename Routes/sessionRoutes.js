const express = require('express')
const router = express.Router()

const sessionController = require("../Controllers/sessionController")
const authMiddleware = require("../Middleware/authMiddleware")
const roleMiddleware = require("../Middleware/roleMiddleware")
const {inputValidator, Schema} = require("../Validators/inputValidator")

router.post('/sessions', authMiddleware, inputValidator(Schema.session), roleMiddleware(['mentor']), sessionController.session)
router.get('/lessons/:id/sessions', authMiddleware, inputValidator(Schema.lessonParams), roleMiddleware(['mentor']), sessionController.getsession);
router.post('/sessions/:sessionId/join', authMiddleware, inputValidator(Schema.joinSession), roleMiddleware(['parent']), sessionController.joinsession);

module.exports = router