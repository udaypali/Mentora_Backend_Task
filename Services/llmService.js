const {GoogleGenerativeAI} = require("@google/generative-ai")
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const MODEL_NAME = process.env.GEMINI_MODEL_NAME
const model = genAI.getGenerativeModel({ model: MODEL_NAME })
exports.summarizeSession = async (text) => {
    const prompt = `
        ### ROLE
        You are a Professional Educational Content Writer for the MENTORA platform.
        
        ### TASK
        Convert the provided "Session Notes" into exactly 3 to 6 concise bullet points for a parent report.
        
        ### STRICT CONSTRAINTS
        1. NO HALLUCINATIONS: Do not invent names, dates, or student progress that is not in the notes.
        2. RAW DATA ONLY: Use only the facts provided. If the notes are sparse, keep the bullets brief.
        3. TONE: Professional, objective, and clear.
        4. STRUCTURE: Output only the 3 bullet points. No introductory text like "Here are the points."
        
        ### INPUT DATA
        Session Notes: ${text}
        
        ### OUTPUT
    `
    const result = await model.generateContent(prompt)
    return {
        summary: result.response.text(),
        model: MODEL_NAME
    }
};