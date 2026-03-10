const ErrorResponse = require('../Utils/errorResponse')
const Student = require("../Models/Student")
const Booking = require("../Models/Booking")
const Session = require("../Models/Session")
const User = require("../Models/User")
const bcrypt = require("bcrypt")

exports.createStudent = async (req, res, next) => {
    const { name, email, password, role } = req.body
    if (!name || !email || !password || !role) {
        return next(new ErrorResponse("Invalid Request Missing Parameters", 400))
    }
    const existingStudent = await Student.findOne({ email })
    if (existingStudent) {
        return next(new ErrorResponse("Student Already Exists", 400))
    } else {
        const hashedPassword = await bcrypt.hash(password, 10)
        const student = await Student.create({
            name,
            email,
            password: hashedPassword,
            role,
            parent: req.user.id
        })
        res.status(201).json({
            message: "Student created",
            student: {
                id: student._id,
                name: student.name,
                email: student.email,
                role: student.role
            }
        })
    }
}

exports.getStudent = async (req, res, next) => {
    let query = {}
    if (req.user.role === "parent") {
        query = { parent: req.user.id }
    }
    const students = await Student.find(query).select("-password")
    res.json(students)
}

exports.deleteStudent = async (req, res, next) => {
    const { studentId } = req.params
    const parentId = req.user.id
    const student = await Student.findById(studentId)
    if (!student) {
        return next(new ErrorResponse("Student not found", 404))
    }
    if (student.parent.toString() !== parentId) {
        return next(new ErrorResponse("Not authorized to delete this student", 403))
    }
    await Booking.deleteMany({ student: studentId })
    await student.deleteOne();
    res.status(200).json({
        success: true,
        message: "Student and related bookings are deleted"
    })
}

exports.updateStudent = async (req, res, next) => {
    const { studentId } = req.params
    const parentId = req.user.id
    const student = await Student.findById(studentId);
    if (!student || student.role !== 'student') {
        return next(new ErrorResponse("Student not Found", 404))
    }
    if (student.parent.toString() !== parentId) {
        return next(new ErrorResponse("Not authorized to update this student", 403))
    }
    if (req.body.password) {
        student.name = req.body.name || student.name;
        student.email = req.body.email || student.email;
        student.password = req.body.password;
        await student.save();
        return res.status(200).json({
            success: true,
            message: "Student profile and password updated successfully"
        });
    }
    const updatedStudent = await Student.findByIdAndUpdate(
        studentId,
        { name: req.body.name, email: req.body.email },
        { new: true, runValidators: true }
    ).select("-password");
    res.status(200).json({
        success: true,
        data: updatedStudent
    });
};