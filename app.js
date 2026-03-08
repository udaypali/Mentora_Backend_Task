const express = require('express')
require('dotenv').config()

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 3000

app.get('/', (req,res) => {
    return res.status(404).json({message: "Not Found"})
})

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})
