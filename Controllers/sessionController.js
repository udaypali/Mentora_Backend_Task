const ErrorResponse = require('../Utils/errorResponse')
const Session = require("../Models/Session")
const Lesson = require("../Models/Lesson")
const Booking = require("../Models/Booking")

exports.session = async (req, res, next) => {
    const { lessonId, date, topic, summary } = req.body
    if (!lessonId || !date || !topic || !summary) {
        return next(new ErrorResponse("Invalid Request Missing Parameters", 400))
    }
    const lesson = await Lesson.findById(lessonId)
    if (!lesson) {
        return next(new ErrorResponse("Lesson not Found", 404))
    }
    const existingSession = await Session.findOne({ lesson: lessonId })
    if (existingSession) {
        return next(new ErrorResponse("Session Already Exists", 400))
    }
    const session = await Session.create({
        lesson: lessonId,
        date,
        topic,
        summary
    })
    res.status(201).json({
        message: "Session Created",
        id: session._id,
        lesson: lessonId,
        date: session.date,
        topic: session.topic,
        summary: session.summary
    })
}

exports.getsession = async (req, res, next) => {
    const { id } = req.params
    const sessions = await Session.find({ lesson: id }).sort({ date: -1 })
    if (!sessions || sessions.length === 0) {
        return next(new ErrorResponse("No Session Found for this Lesson", 404))
    }
    res.status(200).json(sessions)
}

exports.joinsession = async (req, res, next) => {
    const { sessionId } = req.params
    const { studentId } = req.body
    const session = await Session.findById(sessionId)
    if (!session) {
        return next(new ErrorResponse("No Session Found", 404))
    }
    const lessonReference = session.lesson
    const booking = await Booking.findOne({
        student: studentId,
        lesson: lessonReference
    })
    if (!booking) {
        return next(new ErrorResponse("Forbidden Student is not booked for the parent lesson of the session", 400))
    }
    const updatedSession = await Session.findByIdAndUpdate(
        sessionId,
        { $addToSet: { attendees: studentId } },
        { new: true }
    )
    res.status(200).json({
        message: "Student successfully joined the session",
        attendees: updatedSession.attendees.map(a => a.toString())
    })
}