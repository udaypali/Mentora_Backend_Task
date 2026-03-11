const mongoose = require("mongoose")

const sessionSchema = new mongoose.Schema({
    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: { 
        type: String, 
        enum: ["scheduled", "in-progress", "completed", "cancelled"], 
        default: "scheduled" 
    },
    topic: {
        type: String,
        required: true
    },
    startTime: { 
        type: Date
    },
    endTime: { 
        type: Date 
    },
    meetingLink: { 
        type: String 
    },
    recordingUrl: { 
        type: String 
    },
    maxAttendees: { 
        type: Number 
    },
    summary: {
        type: String,
        required: true
    },
    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    }],
    feedback: [{
        student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String }
    }]
}, { timestamps: true })

module.exports = mongoose.model("Session", sessionSchema)