const Joi = require('joi')

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
    }),
    llmSummarise: {
        body: Joi.object({
            text: Joi.string().min(50).max(12000).regex(/^[a-zA-Z0-9\s.,!?'":;\-\/()]+$/).required().messages({
                'string.empty':'400|Text cannot be empty',
                'string.min':'400|Your Content is less than 50 characters.',
                'string.max':'413|Your Content is more than 12000 characters.',
                'string.pattern.base':'422|Forbidden characters detected. Avoid using brackets [] or angle brackets <>.',
                'any.required':'400|Text is required.'
            })
        })
    }
}

module.exports = {inputValidator, Schema}