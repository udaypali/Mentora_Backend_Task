const ErrorResponse = require("../Utils/errorResponse")
const {summarizeSession} = require("../Services/llmService")

exports.summarise = async (req, res, next) => {
    const {text} = req.body
    const result = await summarizeSession(text)
    if (!result || !result.summary) {
        return next(new ErrorResponse("Failed to generate summary from AI", 500))
    }
    const rawBullets = result.summary.split(/\n\*|\n\-|\*|\-/).map(item => item.trim()).filter(item => item.length > 0)
    const numberedSummary = rawBullets.slice(0, 3).map((point, index) => `${index + 1}. ${point}`).join('\n');
    res.status(200).json({
        success: true,
        summary: numberedSummary,
        model: result.model,
    })
}