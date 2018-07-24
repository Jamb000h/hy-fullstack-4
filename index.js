const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')

const config = require('./utils/config')

// Connect to database
mongoose
  .connect(config.mongoURL)
  .then( () => {
    console.log('connected to database', config.mongoURL)
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
const server = http.createServer(app)

const PORT = 3003

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

server.on('close', () => {
  mongoose.connection.close()
})

module.exports = {
  app, server
}