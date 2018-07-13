const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')

// Environment variables
if ( process.env.NODE_ENV !== 'production' ) {
  require('dotenv').config()
}

// Connect to database
mongoose
  .connect(process.env.MONGODB_URI)
  .then( () => {
    console.log('connected to database', process.env.MONGODB_URI)
  })
  .catch( err => {
    console.log(err)
  })

// Set CORS and body parsing mode
app.use(cors())
app.use(bodyParser.json())

// Controllers
const blogsRouter = require('./controllers/blogs')
app.use('/api/blogs', blogsRouter)

// Start server
const PORT = 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})