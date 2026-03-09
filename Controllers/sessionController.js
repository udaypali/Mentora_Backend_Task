const Session = require("../Models/Session")
const Lesson = require("../Models/Lesson")
const Booking = require("../Models/Booking")

exports.session = async (req,res) => {
    try {
        const {lessonId, date, topic, summary} = req.body
        if (!lessonId || !date || !topic ||!summary) {
            return res.status(400).json({message: "Invalid Request Missing Parameters"})
        }
        const lesson = await Lesson.findById(lessonId)
        if (!lesson) {
            return res.status(404).json({message: "Lesson not found"})
        }
        const existingSession = await Session.findOne({lesson: lessonId})
        if (existingSession) {
            return res.status(400).json({message: "Session Already Exists"})
        }
        const session = await Session.create({
            lesson: lessonId,
            date,
            topic,
            summary
        })
        res.status(201).json({
            message: "Session Created",
            id: session._id,
            lesson: lessonId,
            date: session.date,
            topic: session.topic,
            summary: session.summary
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({message: "Invalid Request"})
    }
}

exports.getsession = async (req,res) => {
    try {
        const { id } = req.params;
        const sessions = await Session.find({lesson: id}).sort({date: -1});
        if (!sessions || sessions.length === 0) {
            return res.status(404).json({ message: "No sessions found for this lesson" });
        }
        res.status(200).json(sessions);
    } catch (err) {
        console.log(err)
        return res.status(500).json({message: "Invalid Request"})
    }
}

exports.joinsession = async (req,res) => {
    try {
        const {sessionId} = req.params;
        const {studentId} = req.body;
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({message: "Session not found"})
        }
        const lessonReference = session.lesson; 
        const booking = await Booking.findOne({ 
            student: studentId, 
            lesson: lessonReference 
        });
        if (!booking) {
            return res.status(403).json({ 
                message: "Access Denied: Student is not booked for the parent lesson of this session." 
            });
        }
        const updatedSession = await Session.findByIdAndUpdate(
            sessionId,
            {$addToSet: {attendees: studentId}},
            {new: true}
        );
        res.status(200).json({ 
            message: "Student successfully joined the session", 
            attendees: updatedSession.attendees 
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json({message: "Invalid Request"})
    }
}