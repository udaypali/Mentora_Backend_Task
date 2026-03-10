const express = require('express')
const router = express.Router()

const llmController = require("../Controllers/llmController")
const { aiLimiter } = require("../Middleware/rateLimiter");
const { inputValidator, Schema } = require("../Validators/inputValidator")

/**
 * @swagger
 * tags:
 *   name: LLM
 *   description: AI-powered text summarisation (rate-limited)
 */

/**
 * @swagger
 * /llm/summarize:
 *   post:
 *     summary: Summarise a block of text using the Gemini LLM
 *     tags: [LLM]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LlmSummariseRequest'
 *     responses:
 *       200:
 *         description: Text summarised successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LlmSummariseResponse'
 *       400:
 *         description: Text is empty, missing, or shorter than 50 characters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       413:
 *         description: Text exceeds the 12 000 character limit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Text contains forbidden characters (e.g. HTML / script tags, brackets)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many requests – rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/llm/summarize', aiLimiter, inputValidator(Schema.llmSummarise), llmController.summarise)

module.exports = router