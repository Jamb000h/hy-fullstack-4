const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const middleware = require('./utils/middleware')

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

// Other middlewares
app.use(middleware.tokenExtractor)

// Controllers

const blogsRouter = require('./controllers/blogs')
app.use('/api/blogs', blogsRouter)

const usersRouter = require('./controllers/users')
app.use('/api/users', usersRouter)

const loginRouter = require('./controllers/login')
app.use('/api/login', loginRouter)

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