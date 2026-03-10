const ErrorResponse = require('../Utils/errorResponse')
const Booking = require("../Models/Booking")
const Student = require("../Models/Student")
const Lesson = require("../Models/Lesson")

exports.booking = async (req, res, next) => {
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

exports.getBooking = async (req, res, next) => {
    const { bookingId } = req.params
    const booking = await Booking.findById(bookingId)
    if (!booking) {
        return next(new ErrorResponse("Booking not found", 404))
    }
    res.status(200).json({
        success: true,
        data: booking
    })
}

exports.deleteBooking = async (req, res, next) => {
    const { bookingId } = req.params
    const userId = req.user.id
    const booking = await Booking.findById(bookingId)
    if (!booking) {
        return next(new ErrorResponse("Booking not found", 404))
    }
    const student = await Student.findById(booking.student)
    if (!student || student.parent.toString() !== userId) {
        return next(new ErrorResponse("Not authorized to cancel this booking", 403));
    }
    await booking.deleteOne();
    res.status(200).json({
        success: true,
        message: "Booking canceled successfully"
    });
}