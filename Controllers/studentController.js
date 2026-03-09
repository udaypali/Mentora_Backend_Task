const ErrorResponse = require('../Utils/errorResponse')
const Student = require("../Models/Student")
const bcrypt = require("bcrypt")

exports.createStudent = async (req,res) => {
    const {name, email, password, role} = req.body
    if (!name || !email || !password || !role) {
        return next(new ErrorResponse("Invalid Request Missing Parameters",400))
    } 
    const existingStudent = await Student.findOne({email})
    if (existingStudent) {
        return next(new ErrorResponse("Student Already Exists",400))
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

exports.getStudent = async (req,res) => {
    let query = {}
    if (req.user.role === "parent") {
        query = {parent: req.user.id}
    } 
    else if (req.user.role === "mentor") {
        query = {}
    } 
    else {
        return next(new ErrorResponse("Forbidden Student cannot perform this action",403))
    }
    const students = await Student.find(query).select("-password")
    res.json(students)
}