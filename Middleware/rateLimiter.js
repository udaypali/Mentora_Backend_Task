const rateLimit = require('express-rate-limit')

exports.aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 7,
    message: {
        success: false,
        message: "429|Too many reports generated. Please try again in an minute."
    },
    standardHeaders: true,
    legacyHeaders: false,
})