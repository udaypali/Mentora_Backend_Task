const swaggerJsdoc = require('swagger-jsdoc')
const path = require('path')

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'MENTORA API',
            version: '1.0.0',
            description:
                'REST API for the MENTORA mentorship platform. Supports mentor and parent roles, student management, lesson booking, session tracking, and AI-powered summarisation.',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local development server',
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token (obtained from POST /auth/login)',
                },
            },
            schemas: {
                // ── Generic wrappers ──────────────────────────────────────────
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Something went wrong' },
                    },
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Operation successful' },
                    },
                },
                // ── User ─────────────────────────────────────────────────────
                UserResponse: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '64b1f2c3d4e5f6a7b8c9d0e1' },
                        name: { type: 'string', example: 'Jane Doe' },
                        email: { type: 'string', format: 'email', example: 'jane@example.com' },
                        role: { type: 'string', enum: ['mentor', 'parent'], example: 'mentor' },
                    },
                },
                SignupRequest: {
                    type: 'object',
                    required: ['name', 'email', 'password', 'role'],
                    properties: {
                        name: { type: 'string', minLength: 3, example: 'Jane Doe' },
                        email: { type: 'string', format: 'email', example: 'jane@example.com' },
                        password: { type: 'string', minLength: 6, example: 'secret123' },
                        role: { type: 'string', enum: ['mentor', 'parent'], example: 'mentor' },
                    },
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'jane@example.com' },
                        password: { type: 'string', minLength: 6, example: 'secret123' },
                    },
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    },
                },
                UpdateProfileRequest: {
                    type: 'object',
                    minProperties: 1,
                    properties: {
                        name: { type: 'string', minLength: 3, example: 'Jane Updated' },
                        email: { type: 'string', format: 'email', example: 'updated@example.com' },
                        password: { type: 'string', minLength: 6, example: 'newSecret123' },
                    },
                },
                // ── Student ──────────────────────────────────────────────────
                StudentResponse: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '64b1f2c3d4e5f6a7b8c9d0e2' },
                        name: { type: 'string', example: 'Tom Student' },
                        email: { type: 'string', format: 'email', example: 'tom@example.com' },
                        role: { type: 'string', example: 'student' },
                        parentId: { type: 'string', example: '64b1f2c3d4e5f6a7b8c9d0e1' },
                    },
                },
                CreateStudentRequest: {
                    type: 'object',
                    required: ['name', 'email', 'password'],
                    properties: {
                        name: { type: 'string', minLength: 3, example: 'Tom Student' },
                        email: { type: 'string', format: 'email', example: 'tom@example.com' },
                        password: { type: 'string', minLength: 6, example: 'student123' },
                    },
                },
                UpdateStudentRequest: {
                    type: 'object',
                    minProperties: 1,
                    properties: {
                        name: { type: 'string', minLength: 3, example: 'Tom Updated' },
                        email: { type: 'string', format: 'email', example: 'tomup@example.com' },
                        password: { type: 'string', minLength: 6, example: 'newpass123' },
                    },
                },
                // ── Lesson ───────────────────────────────────────────────────
                LessonResponse: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '64b1f2c3d4e5f6a7b8c9d0e3' },
                        title: { type: 'string', example: 'Introduction to Algebra' },
                        description: { type: 'string', example: 'A beginner-friendly overview of algebraic fundamentals.' },
                        mentorId: { type: 'string', example: '64b1f2c3d4e5f6a7b8c9d0e1' },
                    },
                },
                CreateLessonRequest: {
                    type: 'object',
                    required: ['title', 'description'],
                    properties: {
                        title: { type: 'string', minLength: 3, example: 'Introduction to Algebra' },
                        description: { type: 'string', minLength: 10, example: 'A beginner-friendly overview of algebraic fundamentals.' },
                    },
                },
                UpdateLessonRequest: {
                    type: 'object',
                    minProperties: 1,
                    properties: {
                        title: { type: 'string', minLength: 3, example: 'Advanced Algebra' },
                        description: { type: 'string', minLength: 10, example: 'Covers quadratic equations and inequalities.' },
                    },
                },
                // ── Booking ──────────────────────────────────────────────────
                BookingResponse: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '64b1f2c3d4e5f6a7b8c9d0e4' },
                        studentId: { type: 'string', example: '64b1f2c3d4e5f6a7b8c9d0e2' },
                        lessonId: { type: 'string', example: '64b1f2c3d4e5f6a7b8c9d0e3' },
                        parentId: { type: 'string', example: '64b1f2c3d4e5f6a7b8c9d0e1' },
                    },
                },
                CreateBookingRequest: {
                    type: 'object',
                    required: ['studentId', 'lessonId'],
                    properties: {
                        studentId: { type: 'string', pattern: '^[0-9a-fA-F]{24}$', example: '64b1f2c3d4e5f6a7b8c9d0e2' },
                        lessonId: { type: 'string', pattern: '^[0-9a-fA-F]{24}$', example: '64b1f2c3d4e5f6a7b8c9d0e3' },
                    },
                },
                // ── Session ──────────────────────────────────────────────────
                SessionResponse: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '64b1f2c3d4e5f6a7b8c9d0e5' },
                        lessonId: { type: 'string', example: '64b1f2c3d4e5f6a7b8c9d0e3' },
                        date: { type: 'string', format: 'date-time', example: '2025-06-15T10:00:00.000Z' },
                        topic: { type: 'string', example: 'Quadratic Equations' },
                        summary: { type: 'string', example: 'Covered solving quadratic equations using the quadratic formula.' },
                        attendees: { type: 'array', items: { type: 'string' }, example: [] },
                    },
                },
                CreateSessionRequest: {
                    type: 'object',
                    required: ['lessonId', 'date', 'topic', 'summary'],
                    properties: {
                        lessonId: { type: 'string', pattern: '^[0-9a-fA-F]{24}$', example: '64b1f2c3d4e5f6a7b8c9d0e3' },
                        date: { type: 'string', format: 'date-time', example: '2025-06-15T10:00:00.000Z' },
                        topic: { type: 'string', maxLength: 100, example: 'Quadratic Equations' },
                        summary: { type: 'string', minLength: 10, example: 'Covered solving quadratic equations using the quadratic formula.' },
                    },
                },
                UpdateSessionRequest: {
                    type: 'object',
                    minProperties: 1,
                    properties: {
                        topic: { type: 'string', maxLength: 100, example: 'Updated Topic' },
                        summary: { type: 'string', minLength: 10, example: 'Updated session summary with more detail.' },
                    },
                },
                JoinSessionRequest: {
                    type: 'object',
                    required: ['studentId'],
                    properties: {
                        studentId: { type: 'string', pattern: '^[0-9a-fA-F]{24}$', example: '64b1f2c3d4e5f6a7b8c9d0e2' },
                    },
                },
                // ── LLM ──────────────────────────────────────────────────────
                LlmSummariseRequest: {
                    type: 'object',
                    required: ['text'],
                    properties: {
                        text: {
                            type: 'string',
                            minLength: 50,
                            maxLength: 12000,
                            example: 'In this lesson we covered the fundamental concepts of algebra, including variables, expressions, and simple equations. Students practised solving for x in single-variable problems.',
                        },
                    },
                },
                LlmSummariseResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        summary: { type: 'string', example: 'The lesson covered core algebraic concepts such as variables, expressions, and solving simple equations.' },
                        model: { type: 'string', example: 'gemini-1.5-flash' },
                    },
                },
            },
        },
    },
    apis: [
        path.join(__dirname, '../Routes/authRoutes.js'),
        path.join(__dirname, '../Routes/studentRoutes.js'),
        path.join(__dirname, '../Routes/lessonRoutes.js'),
        path.join(__dirname, '../Routes/bookingRoutes.js'),
        path.join(__dirname, '../Routes/sessionRoutes.js'),
        path.join(__dirname, '../Routes/llmRoutes.js'),
    ],
}

const swaggerSpec = swaggerJsdoc(options)

module.exports = swaggerSpec
