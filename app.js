require('dotenv').config()

const express = require('express')
const connectDB = require('./config/db')
const authRoutes = require("./Routes/authRoutes");
const studentRoutes = require("./Routes/studentRoutes")
const lessonRoutes = require("./Routes/lessonRoutes")
const bookingRoutes = require("./Routes/bookingRoutes")
const sessionRoutes = require("./Routes/sessionRoutes")
const llmRoutes = require('./Routes/llmRoutes')
const errorMiddleware = require('./Middleware/errorMiddleware')
const ErrorResponse = require('./Utils/errorResponse')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(authRoutes)
app.use(studentRoutes)
app.use(lessonRoutes)
app.use(bookingRoutes)
app.use(sessionRoutes)
app.use(llmRoutes)

const PORT = process.env.PORT || 3000

app.get('/', (req, res, next) => {
    return next(new ErrorResponse("Not Found!", 404))
})

app.use(errorMiddleware)

connectDB();

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
}

module.exports = app
