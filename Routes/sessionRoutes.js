const express = require('express')
const router = express.Router()

const sessionController = require("../Controllers/sessionController")
const authMiddleware = require("../Middleware/authMiddleware")

router.post('/sessions', authMiddleware, sessionController.session)
router.get('/lessons/:id/sessions', authMiddleware, sessionController.getsession);

module.exports = router