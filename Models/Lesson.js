const mongoose = require("mongoose")

// create a schema for the database
const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model("Lesson", lessonSchema)