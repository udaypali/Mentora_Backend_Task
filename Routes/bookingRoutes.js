const express = require('express')
const router = express.Router()

const bookingController = require("../Controllers/bookingController")
const authMiddleware = require("../Middleware/authMiddleware")

router.post('/bookings', authMiddleware, bookingController.createbooking)

module.exports = router