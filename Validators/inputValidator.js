const Joi = require('joi');
const { markAttendance } = require('../Controllers/sessionController');

const inputValidator = (Schema) => {
    return (req, res, next) => {
        const validations = ['body', 'params', 'query'].map(key => {
            if (Schema[key]) {
                return Schema[key].validate(req[key], { abortEarly: false });
            }
            return null;
        });
        const errorObj = validations.find(v => v && v.error);
        if (errorObj) {
            const rawMessage = errorObj.error.details[0].message;
            if (rawMessage.includes('|')) {
                const [code, cleanMessage] = rawMessage.split('|');
                return res.status(parseInt(code)).json({
                    success: false,
                    message: cleanMessage
                });
            }
            return res.status(400).json({ success: false, message: rawMessage });
        }
        next();
    };
};

const objectId = (label) =>
    Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({ 'string.pattern.base': `Invalid ${label} ID format` });
const forbidden403 = (msg) =>
    Joi.any().forbidden().messages({ 'any.unknown': `403|${msg}` });

const Schema = {
    signup: {
        body: Joi.object({
            name: Joi.string().min(3).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required(),
            role: Joi.string().valid('parent', 'mentor').required()
        })
    },
    login: {
        body: Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required()
        })
    },
    updateProfile: {
        body: Joi.object({
            name: Joi.string().min(3).optional(),
            email: Joi.string().email().optional(),
            password: Joi.string().min(6).optional(),
            role: forbidden403('You are not permitted to change your account role.'),
            _id: forbidden403('The account ID is immutable.'),
            id: forbidden403('The account ID is immutable.')
        }).min(1).messages({
            'object.min': '400|Please provide at least one field to update (name, email, or password).'
        })
    },
    student: {
        body: Joi.object({
            name: Joi.string().min(3).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required(),
            role: Joi.string().valid('student').default('student')
        })
    },
    deleteStudent: {
        params: Joi.object({
            studentId: objectId('Student')
        })
    },
    updateStudent: {
        params: Joi.object({
            studentId: objectId('Student')
        }),
        body: Joi.object({
            name: Joi.string().min(3).optional(),
            email: Joi.string().email().optional(),
            password: Joi.string().min(6).optional(),
            role: forbidden403("You cannot change a student's role."),
            parentId: forbidden403('You cannot reassign a student to a different parent.')
        }).min(1)
    },
    studentProgress: {
        params: Joi.object({
            studentId: objectId('Student')
        })
    },
    lesson: {
        body: Joi.object({
            title: Joi.string().min(3).required(),
            description: Joi.string().min(10).required()
        })
    },
    getLesson: {
        params: Joi.object({
            lessonId: objectId('Lesson')
        })
    },
    deleteLesson: {
        params: Joi.object({
            lessonId: objectId('Lesson')
        })
    },
    updateLesson: {
        params: Joi.object({
            lessonId: objectId('Lesson')
        }),
        body: Joi.object({
            title: Joi.string().min(3).optional(),
            description: Joi.string().min(10).optional()
        }).min(1)
    },
    booking: {
        body: Joi.object({
            studentId: objectId('Student'),
            lessonId: objectId('Lesson')
        })
    },
    getBooking: {
        params: Joi.object({
            bookingId: objectId('Booking')
        })
    },
    deleteBooking: {
        params: Joi.object({
            bookingId: objectId('Booking')
        })
    },
    session: {
        body: Joi.object({
            lessonId: objectId('Lesson'),
            date: Joi.date().iso().required(),
            topic: Joi.string().max(100).required(),
            summary: Joi.string().min(10).required(),
            status: Joi.string().valid("scheduled", "in-progress", "completed", "cancelled").default("scheduled"),
            startTime: Joi.date().iso().allow(null, ''),
            endTime: Joi.date().iso().allow(null, ''),
            meetingLink: Joi.string().uri().allow(null, ''),
            recordingUrl: Joi.string().uri().allow(null, ''),
            maxAttendees: Joi.number().integer().min(1).max(500).default(30)
        })
    },
    getSession: {
        params: Joi.object({
            lessonId: objectId('Lesson')
        })
    },
    deleteSession: {
        params: Joi.object({
            sessionId: objectId('Session')
        })
    },
    updateSession: {
        params: Joi.object({
            sessionId: objectId('Session')
        }),
        body: Joi.object({
            topic: Joi.string().max(100).optional(),
            summary: Joi.string().min(10).optional()
        }).min(1)
    },
    joinSession: {
        params: Joi.object({
            sessionId: objectId('Session')
        }),
        body: Joi.object({
            studentId: objectId('Student')
        })
    },
    markAttendance: {
        body: Joi.object({
            studentId: objectId('Student'),
            sessionId: objectId('Session'),
            lessonId: objectId('Lesson')
        })
    },
    llmSummarise: {
        body: Joi.object({
            text: Joi.string()
                .min(50)
                .max(12000)
                .regex(/^[a-zA-Z0-9\s.,!?'":;\-\/()]+$/)
                .required()
                .messages({
                    'string.empty': '400|Text cannot be empty',
                    'string.min': '400|Your Content is less than 50 characters.',
                    'string.max': '413|Your Content is more than 12000 characters.',
                    'string.pattern.base': '422|Forbidden characters detected. Avoid using brackets [] or angle brackets <>.',
                    'any.required': '400|Text is required.'
                })
        })
    }
}

module.exports = { inputValidator, Schema }