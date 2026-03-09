const express = require('express')
const router = express.Router()

const bookingController = require("../Controllers/bookingController")
const authMiddleware = require("../Middleware/authMiddleware")
const roleMiddleware = require("../Middleware/roleMiddleware")
const {inputValidator, Schema} = require("../Validators/inputValidator")

router.post('/bookings', authMiddleware, inputValidator(Schema.booking), roleMiddleware(['parent']), bookingController.createbooking)

module.exports = router