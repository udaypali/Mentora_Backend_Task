const express = require('express')
const router = express.Router()

const bookingController = require("../Controllers/bookingController")
const authMiddleware = require("../Middleware/authMiddleware")
const roleMiddleware = require("../Middleware/roleMiddleware")
const {inputValidator, Schema} = require("../Validators/inputValidator")

router.post('/bookings', authMiddleware, inputValidator(Schema.booking), roleMiddleware(['parent']), bookingController.booking)
router.delete('/bookings/:bookingId', authMiddleware, inputValidator(Schema.deleteBooking), roleMiddleware(['parent']), bookingController.deleteBooking)
router.get('/bookings/:bookingId', inputValidator(Schema.getBooking), authMiddleware, bookingController.getBooking)

module.exports = router