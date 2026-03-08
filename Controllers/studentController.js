const Student = require("../Models/Student");
const bcrypt = require("bcrypt")

exports.createStudent = async (req,res) => {
    try {
        if (req.user.role !== "parent") {
            return res.status(403).json({message: "Only parents can create students"})
        }
        const {name, email, password, role} = req.body
        if (!name || !email || !password || !role) {
            return res.status(400).json({message: "Invalid Request Missing Parameters"})
        } 
        const existingStudent = await Student.findOne({email})
        if (existingStudent) {
            return res.status(400).json({message: "Student Already Exists"})
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
    } catch (err) {
        console.log(err)
        return res.status(500).json({message: "Invalid Response"})
    }
}


exports.getStudent = async (req,res) => {
    try {
        let query = {};
        if (req.user.role === "parent") {
            query = {parent: req.user.id};
        } 
        else if (req.user.role === "mentor") {
            query = {}; 
        } 
        else {
            return res.status(403).json({message: "Forbidden"});
        }
        const students = await Student.find(query).select("-password")
        res.json(students)
    } catch (err) {
        console.log(err)
        return res.status(500).json({message: "Invalid Response"})
    }
}