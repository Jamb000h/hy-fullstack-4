const jwt = require('jsonwebtoken')

const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
    .populate('user', { username: 1, name: 1 })
  response.json(blogs.map(Blog.format))
})

blogsRouter.get('/:id', async (request, response) => {
  try {
    const blog = await Blog.findById(request.params.id)
      .populate('user', { username: 1, name: 1 })
    if(blog) {
      response.json(Blog.format(blog))
    } else {
      response.status(404).json({ error: 'Blog not found' })
    }
  } catch (e) {
    response.status(400).json({ error: 'Malformatted id' })
  }
})

blogsRouter.post('/', async (request, response) => {
  try {

    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    if(request.body.title === undefined)
      return response.status(400).json({ error: 'Title is required!' })

    if(request.body.url === undefined)
      return response.status(400).json({ error: 'URL is required!' })

    if(request.body.likes === undefined)
      request.body.likes = 0

    const user = await User.findById(decodedToken.id)

    const body = request.body

    const newBlog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes || 0,
      user: user._id
    }

    const blog = new Blog(newBlog)

    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(Blog.format(savedBlog))
  } catch(exception) {
    if (exception.name === 'JsonWebTokenError' ) {
      response.status(401).json({ error: exception.message })
    } else {
      console.log(exception)
      response.status(500).json({ error: 'something went wrong...' })
    }
  }
})

blogsRouter.put('/:id', async (request, response) => {
  try {
    if(request.body.title === undefined)
      return response.status(400).json({ error: 'Title is required!' })

    if(request.body.url === undefined)
      return response.status(400).json({ error: 'URL is required!' })

    if(request.body.likes === undefined)
      request.body.likes = 0

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, request.body, { new: true })

    if(updatedBlog) {
      response.status(200).end()
    } else {
      response.status(404).json({ error: 'Blog not found' })
    }
  } catch (e) {
    response.status(400).json({ error: 'Malformed id' })
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  try {
    const blog = await Blog.findByIdAndRemove(request.params.id)
    if(blog) {
      response.status(204).end()
    } else {
      response.status(404).json({ error: 'Blog not found' })
    }
  } catch (e) {
    response.status(400).json({ error: 'Malformatted id' })
  }
})

module.exports = blogsRouter