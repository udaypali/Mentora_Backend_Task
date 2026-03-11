const mongoose = require("mongoose")

const progressSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
        required: true
    },
    completeSession: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
        required: false
    },
    overallProgress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    notes: [
        {
            date: { type: Date, default: Date.now },
            content: String,
            mentor: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        }
    ],
    milestones: [
        {
            name: String,
            archivedAt: Date
        }
    ]
}, { timestamps: true })

module.exports = mongoose.model("Progress", progressSchema)