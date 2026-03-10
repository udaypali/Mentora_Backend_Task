const ErrorResponse = require('../Utils/errorResponse')
const Lesson = require("../Models/Lesson")
const Session = require("../Models/Session")
const Booking = require("../Models/Booking")

exports.lesson = async (req, res, next) => {
    const { title, description } = req.body
    if (!title || !description) {
        return next(new ErrorResponse("Invalid Request Missing Parameters", 400))
    }
    const exisitngLesson = await Lesson.findOne({ title })
    if (exisitngLesson) {
        return next(new ErrorResponse("Lesson Already Exists", 400))
    } else {
        const lesson = await Lesson.create({
            title,
            description,
            mentor: req.user.id
        })
        res.status(201).json({
            message: "Created Lesson",
            Lesson: {
                id: lesson._id,
                title: lesson.title,
                description: lesson.description,
            }
        })
    }
}

exports.getAllLesson = async (req, res, next) => {
    const lesson = await Lesson.find()
    if (!lesson) {
        return next(new ErrorResponse("No Lessons Found", 404))
    }
    res.status(200).json({
        sucess: true,
        data: lesson
    })
}

exports.getLesson = async (req, res, next) => {
    const { lessonId } = req.params
    const lesson = await Lesson.findById(lessonId)
    if (!lesson) {
        return next(new ErrorResponse("Lesson not Found", 404))
    }
    res.status(200).json({
        sucess: true,
        data: lesson
    })
}

exports.deleteLesson = async (req, res, next) => {
    const { lessonId } = req.params
    const userId = req.user.id
    const lesson = await Lesson.findById(lessonId)
    if (!lesson) {
        return next(new ErrorResponse("Lesson not Found", 404))
    }
    if (lesson.mentor.toString() !== userId) {
        return next(new ErrorResponse("Not authorized to delete this lesson", 403))
    }
    await Session.deleteMany({ lesson: lessonId })
    await Booking.deleteMany({ lesson: lessonId })
    await lesson.deleteOne()
    res.status(200).json({
        success: true,
        message: "Lesson deleted successfully"
    })
}

exports.updateLesson = async (req, res, next) => {
    const { lessonId } = req.params
    const userId = req.user.id
    const lesson = await Lesson.findById(lessonId)
    if (!lesson) {
        return next(new ErrorResponse("Lesson not Found", 404))
    }
    if (lesson.mentor.toString() !== userId) {
        return next(new ErrorResponse("Not authorized to update this lesson", 403))
    }
    const updateLesson = await Lesson.findByIdAndUpdate(
        lessonId,
        { title: req.body.title, description: req.body.description },
        { new: true, runValidators: true }
    )
    res.status(200).json({
        success: true,
        data: updateLesson
    })

}