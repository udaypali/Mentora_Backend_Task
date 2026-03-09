const express = require('express')
const router = express.Router()

const sessionController = require("../Controllers/sessionController")
const authMiddleware = require("../Middleware/authMiddleware")
const roleMiddleware = require("../Middleware/roleMiddleware")

router.post('/sessions', authMiddleware, roleMiddleware(['mentor']), sessionController.session)
router.get('/lessons/:id/sessions', authMiddleware, roleMiddleware(['mentor']), sessionController.getsession);
router.post('/sessions/:sessionId/join', authMiddleware, roleMiddleware(['parent']), sessionController.joinsession);

module.exports = router