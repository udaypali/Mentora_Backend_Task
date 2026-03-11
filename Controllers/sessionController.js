const ErrorResponse = require('../Utils/errorResponse')
const Session = require("../Models/Session")
const Lesson = require("../Models/Lesson")
const Booking = require("../Models/Booking")
const updateStudentProgress = require("../Utils/progressHelper")

exports.session = async (req, res, next) => {
    const {
        lessonId, date, topic, summary,
        status, startTime, endTime,
        meetingLink, maxAttendees
    } = req.body
    if (!lessonId || !date || !topic || !summary) {
        return next(new ErrorResponse("Invalid Request Missing Parameters", 400))
    }
    const lesson = await Lesson.findById(lessonId)
    if (!lesson) {
        return next(new ErrorResponse("Lesson not Found", 404))
    }
    const duplicateTime = await Session.findOne({ lesson: lessonId, date })
    if (duplicateTime) {
        return next(new ErrorResponse("A session for this lesson is already scheduled at this time", 400))
    }
    const session = await Session.create({
        lesson: lessonId,
        date,
        topic,
        summary,
        status: status || "scheduled",
        startTime,
        endTime,
        meetingLink,
        maxAttendees: maxAttendees || 30
    });
    res.status(201).json({
        success: true,
        message: "Session Created Successfully",
        data: session
    });
};

exports.getSession = async (req, res, next) => {
    const { lessonId } = req.params
    const sessions = await Session.find({ lesson: lessonId }).sort({ date: -1 })
    if (!sessions || sessions.length === 0) {
        return next(new ErrorResponse("No Session Found for this Lesson", 404))
    }
    res.status(200).json(sessions)
}

exports.deleteSession = async (req, res, next) => {
    const { sessionId } = req.params
    const userId = req.user.id
    const session = await Session.findById(sessionId);
    if (!session) {
        return next(new ErrorResponse("Session not found", 404))
    }
    const lesson = await Lesson.findById(session.lesson)
    if (lesson.mentor.toString() !== userId) {
        return next(new ErrorResponse("Not authorized to delete this session", 403))
    }
    await session.deleteOne()
    res.status(200).json({
        success: true,
        message: "Session deleted successfully"
    })
}

exports.updateSession = async (req, res, next) => {
    const { sessionId } = req.params
    const userId = req.user.id
    const session = await Session.findById(sessionId)
    if (!session) {
        return next(new ErrorResponse("Session not found", 404))
    }
    const lesson = await Lesson.findById(session.lesson)
    if (lesson.mentor.toString() !== userId) {
        return next(new ErrorResponse("Not authorized to update this session", 403))
    }
    session.topic = req.body.topic || session.topic
    session.summary = req.body.summary || session.summary
    await session.save()
    res.status(200).json({
        success: true,
        data: session
    })
}

exports.joinSession = async (req, res, next) => {
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

exports.markAttendance = async (req, res, next) => {
    const { studentId, sessionId, lessonId } = req.body
    const session = await Session.findById(sessionId)
    if (!session) return next(new ErrorResponse("Session not found", 404))
    await Session.findByIdAndUpdate(
        sessionId,
        {
            $addToSet: { attendees: studentId },
            status: "completed"
        }
    )
    await updateStudentProgress.updateStudentProgress(studentId, lessonId)
    res.status(200).json({
        success: true,
        message: "Attendance marked and progress updated"
    })
}