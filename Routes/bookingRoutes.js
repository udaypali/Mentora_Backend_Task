const express = require('express')
const router = express.Router()

const bookingController = require("../Controllers/bookingController")
const authMiddleware = require("../Middleware/authMiddleware")
const roleMiddleware = require("../Middleware/roleMiddleware")

router.post('/bookings', authMiddleware, roleMiddleware(['parent']), bookingController.createbooking)

module.exports = router