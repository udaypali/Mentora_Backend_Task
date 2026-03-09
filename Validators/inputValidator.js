const Joi = require('joi')

const inputValidator = (Schema) => {
    return (req, res, next) => {
        const validations = ['body', 'params', 'query'].map(key => {
            if (Schema[key]) {
                return Schema[key].validate(req[key], { abortEarly: false })
            }
            return null
        });
        const errors = validations
            .filter(v => v && v.error)
            .map(v => v.error.details.map(d => d.message).join(', '))
        if (errors.length > 0) {
            return res.status(400).json({ message: errors.join(' | ') })
        }
        next()
    }
}

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
    student: {
        body: Joi.object({
            name: Joi.string().min(3).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required(),
            role: Joi.string().valid('parent', 'mentor').required()
        })
    },
    lesson: {
        body: Joi.object({
            title: Joi.string().min(3).required(),
            description: Joi.string().min(10).required()
        })
    },
    booking: {
        body: Joi.object({
            studentId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Invalid Student ID format'
            }),
            lessonId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Invalid Lesson ID format'
            })
        })
    },
    session: {
        body: Joi.object({
            lessonId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Invalid Lesson ID format'
            }),
            date: Joi.date().iso().required(),
            topic: Joi.string().max(100).required(),
            summary: Joi.string().min(10).required()
        })
    },
    lessonParams: {
        param: Joi.object({
            lessonId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Invalid Lesson ID format in URL'
            })
        })
    },
    joinSession: Joi.object({
        params: Joi.object({
            sessionId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Invalid Session ID format in URL'
            })
        }),
        body: Joi.object({
            studentId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Invalid Student ID format'
            })
        })
    })
}

module.exports = {inputValidator, Schema}