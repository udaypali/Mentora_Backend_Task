const ErrorResponse = require('../Utils/errorResponse')
const Lesson = require("../Models/Lesson")

exports.createlesson = async (req,res) => {
    const {title, description} = req.body
    if (!title || !description) {
        return next(new ErrorResponse("Invalid Request Missing Parameters",400))
    }
    const exisitngLesson = await Lesson.findOne({title})
    if (exisitngLesson) {
        return next(new ErrorResponse("Lesson Already Exists",400))
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