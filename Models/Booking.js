const mongoose = require("mongoose")

// create a schema for the database
const bookingSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model("Booking", bookingSchema)