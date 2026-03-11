const Session = require('../Models/Session')
const Progress = require('../Models/Progress')

exports.updateStudentProgress = async (studentId, lessonId) => {
    const totalCompletedSessions = await Session.countDocuments({
        lesson: lessonId,
        status: "completed"
    });
    const attendedSessions = await Session.countDocuments({
        lesson: lessonId,
        status: "completed",
        attendees: studentId
    });
    const progressPercentage = totalCompletedSessions > 0
        ? Math.round((attendedSessions / totalCompletedSessions) * 100)
        : 0;
    await Progress.findOneAndUpdate(
        { student: studentId, lesson: lessonId },
        {
            $set: { overallProgress: progressPercentage },
            $setOnInsert: { student: studentId, lesson: lessonId }
        },
        { upsert: true, new: true }
    );
};