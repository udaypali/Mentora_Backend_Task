const Lesson = require("../Models/Lesson");

// creation of lesson (mentor only)
exports.createlesson = async (req,res) => {
    try {
        if (req.user.role !== "mentor") {
            return res.status(403).json({message: "Forbidden only mentor can create lessons"})
        } 
        const {title, description} = req.body
        if (!title || !description) {
            return res.status(400).json({message: "Invalid Request Missing Parameters"})
        }
        const exisitngLesson = await Lesson.findOne({title})
        if (exisitngLesson) {
            return res.status(400).json({message: "Lesson Already Exists"})
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
    } catch (err) {
        console.log(err)
        return res.status(500).json({message: "Invalid Response"})
    }
}