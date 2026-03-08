const express = require('express')
const connectDB = require('./config/db')
const authRoutes = require("./Routes/authRoutes");
const studentRoutes = require("./Routes/studentRoutes")
const lessonRoutes = require("./Routes/lessonRoutes")
const bookingRoutes = require("./Routes/bookingRoutes")
const sessionRoutes = require("./Routes/sessionRoutes")

require('dotenv').config()

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use(authRoutes)
app.use(studentRoutes)
app.use(lessonRoutes)
app.use(bookingRoutes)
app.use(sessionRoutes)

const PORT = process.env.PORT || 3000

app.get('/', (req,res) => {
    return res.status(404).json({message: "Not Found"})
})

connectDB();

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})
