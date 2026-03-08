const express = require('express')
const connectDB = require('./config/db')
const authRoutes = require("./Routes/authRoutes");
require('dotenv').config()

const app = express()
app.use(express.json())
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3000

app.get('/', (req,res) => {
    return res.status(404).json({message: "Not Found"})
})

connectDB();

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})
