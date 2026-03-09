const ErrorResponse = require('../Utils/errorResponse')
const Booking = require("../Models/Booking")
const Student = require("../Models/Student")
const Lesson = require("../Models/Lesson")

exports.createbooking = async (req, res, next) => {
    const { studentId, lessonId } = req.body
    const student = await Student.findById(studentId)
    if (!student) {
        return next(new ErrorResponse("Student not Found", 404))
    }
    const lesson = await Lesson.findById(lessonId)
    if (!lesson) {
        return next(new ErrorResponse("Lesson not Found", 404))
    }
    const existingBooking = await Booking.findOne({
        student: studentId,
        lesson: lessonId
    })
    if (existingBooking) {
        return next(new ErrorResponse("Booking Already Exists", 400))
    }
    const booking = await Booking.create({
        student: studentId,
        lesson: lessonId
    })
    res.status(201).json({
        message: "Booking Created",
        id: booking._id,
        student: studentId,
        lesson: lessonId
    })
}