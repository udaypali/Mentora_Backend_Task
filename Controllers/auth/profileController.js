const User = require("../../Models/User")
const Student = require('../../Models/Student');
const Lesson = require('../../Models/Lesson');
const Booking = require('../../Models/Booking');
const Session = require('../../Models/Session');

exports.profile = async (req, res) => {
    const user = await User.findById(req.user.id).select("-password")
    res.json(user)
}

exports.deleteProfile = async (req, res) => {
    const userId = req.user.id
    const userRole = req.user.role
    if (userRole === "parent") {
        const students = await Student.find({ parentId: userId })
        const studentIds = students.map(s => s._id)
        await Booking.deleteMany({ studentId: { $in: studentIds } })
        await Student.deleteMany({ parentId: userId })
    }
    if (userRole === "mentor") {
        const lessons = await Lesson.find({ mentorId: userId })
        const lessonIds = lessons.map(l => l._id)
        await Session.deleteMany({ lessonId: { $in: lessonIds } })
        await Booking.deleteMany({ lessonId: { $in: lessonIds } })
        await Lesson.deleteMany({ mentorId: userId })
    }
    await User.findByIdAndDelete(userId)
    res.status(200).json({
        success: true,
        message: "User account and all associated data deleted successfully."
    })
}

exports.updateProfile = async (req, res) => {
    const updateFields = {
        name: req.body.name,
        email: req.body.email
    }
    if (req.body.password) {
        const user = await User.findById(req.user.id);
        user.name = req.body.name || user.name
        user.email = req.body.email || user.email
        user.password = req.body.password || user.password
        await user.save()
        return res.status(200).json({ message: "Profile and Password has been updated" })
    }
    const updateUser = await User.findByIdAndUpdate(
        req.user.id,
        updateFields,
        { new: true, runValidators: true }
    ).select("-password")
    res.status(200).json({
        success: true,
        data: updateUser
    })
}