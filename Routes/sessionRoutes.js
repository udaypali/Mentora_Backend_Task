const express = require('express')
const router = express.Router()

const sessionController = require("../Controllers/sessionController")
const authMiddleware = require("../Middleware/authMiddleware")
const roleMiddleware = require("../Middleware/roleMiddleware")
const { inputValidator, Schema } = require("../Validators/inputValidator")

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: Session management (mentor role required for most operations)
 */

/**
 * @swagger
 * /sessions:
 *   post:
 *     summary: Create a new session for a lesson (mentor only)
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSessionRequest'
 *     responses:
 *       201:
 *         description: Session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     session:
 *                       $ref: '#/components/schemas/SessionResponse'
 *       400:
 *         description: Validation error or invalid ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden – only mentors can create sessions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/sessions', authMiddleware, inputValidator(Schema.session), roleMiddleware(['mentor']), sessionController.session)

/**
 * @swagger
 * /sessions/{sessionId}/join:
 *   post:
 *     summary: Join a session with a student (parent only)
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the session
 *         example: 64b1f2c3d4e5f6a7b8c9d0e5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JoinSessionRequest'
 *     responses:
 *       200:
 *         description: Student successfully added to the session
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     session:
 *                       $ref: '#/components/schemas/SessionResponse'
 *       400:
 *         description: Validation error or invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden – only parents can join sessions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/sessions/:sessionId/join', authMiddleware, inputValidator(Schema.joinSession), roleMiddleware(['parent']), sessionController.joinSession)

/**
 * @swagger
 * /sessions/{sessionId}:
 *   put:
 *     summary: Update a session (mentor only)
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the session
 *         example: 64b1f2c3d4e5f6a7b8c9d0e5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSessionRequest'
 *     responses:
 *       200:
 *         description: Session updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     session:
 *                       $ref: '#/components/schemas/SessionResponse'
 *       400:
 *         description: Validation error or invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden – only the session's mentor can update
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: Delete a session (mentor only)
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the session
 *         example: 64b1f2c3d4e5f6a7b8c9d0e5
 *     responses:
 *       200:
 *         description: Session deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden – only the session's mentor can delete
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/sessions/:sessionId', authMiddleware, inputValidator(Schema.deleteSession), roleMiddleware(['mentor']), sessionController.deleteSession)
router.put('/sessions/:sessionId', authMiddleware, inputValidator(Schema.updateSession), roleMiddleware(['mentor']), sessionController.updateSession)

/**
 * @swagger
 * /lessons/{lessonId}/sessions:
 *   get:
 *     summary: Get all sessions for a lesson (mentor only)
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the lesson
 *         example: 64b1f2c3d4e5f6a7b8c9d0e3
 *     responses:
 *       200:
 *         description: List of sessions for the lesson
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     sessions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SessionResponse'
 *       400:
 *         description: Invalid lesson ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden – only mentors can view session lists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/lessons/:lessonId/sessions', authMiddleware, inputValidator(Schema.getSession), roleMiddleware(['mentor']), sessionController.getSession)

/**
 * @swagger
 * /markAttendance:
 *   post:
 *     summary: Mark student attendance for a session and update progress (mentor only)
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - sessionId
 *               - lessonId
 *             properties:
 *               studentId:
 *                 type: string
 *                 pattern: '^[0-9a-fA-F]{24}$'
 *                 description: MongoDB ObjectId of the student
 *                 example: 64b1f2c3d4e5f6a7b8c9d0e2
 *               sessionId:
 *                 type: string
 *                 pattern: '^[0-9a-fA-F]{24}$'
 *                 description: MongoDB ObjectId of the session
 *                 example: 64b1f2c3d4e5f6a7b8c9d0e5
 *               lessonId:
 *                 type: string
 *                 pattern: '^[0-9a-fA-F]{24}$'
 *                 description: MongoDB ObjectId of the lesson
 *                 example: 64b1f2c3d4e5f6a7b8c9d0e3
 *     responses:
 *       200:
 *         description: Attendance marked and progress updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error or invalid ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden – only mentors can mark attendance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/markAttendance', authMiddleware, inputValidator(Schema.markAttendance), roleMiddleware(['mentor']), sessionController.markAttendance)

module.exports = router