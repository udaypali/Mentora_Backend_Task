const Booking = require("../Models/Booking");
const Student = require("../Models/Student");
const Lesson = require("../Models/Lesson");

exports.createbooking = async (req,res) => {
    try {
        if (req.user.role !== "parent") {
            return res.status(403).json({message: "FOrbidden only parent can assign lesson to student"})
        }
        const {studentEmail, lessonTitle} = req.body;
        if (!studentEmail || !lessonTitle) {
            return res.status(400).json({message: "Invalid Request Missing Parameters"})
        }
        const student = await Student.findOne({email: studentEmail});
        if (!student) {
            return res.status(404).json({message: "Student not found with that email"});
        }
        const lesson = await Lesson.findOne({title: lessonTitle});
        if (!lesson) {
            return res.status(404).json({message: "Lesson not found with that title"});
        }
        const exisitngBooking = await Booking.findOne({student: student._id, lesson: lesson._id})
        if (exisitngBooking) {
            return res.status(400).json({message: "Booking Already Exists"})
        } else {
            const booking = await Booking.create({
                student: student._id,
                lesson: lesson._id
            })
            res.status(201).json({
                message: "Booking Created",
                id: booking._id,
                student: student._id,
                lesson: lesson._id
            })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({message: "Invalid Request"})
    }
}