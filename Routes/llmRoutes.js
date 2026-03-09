const express = require('express')
const router = express.Router()

const llmController = require("../Controllers/llmController")
const {aiLimiter} = require("../Middleware/rateLimiter");
const {inputValidator, Schema} = require("../Validators/inputValidator")

router.post('/llm/summarize', aiLimiter, inputValidator(Schema.llmSummarise), llmController.summarise)

module.exports = router