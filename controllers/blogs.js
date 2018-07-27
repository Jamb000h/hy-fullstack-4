const jwt = require('jsonwebtoken')

const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

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
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    if(request.body.title === undefined)
      return response.status(400).json({ error: 'Title is required!' })

    if(request.body.url === undefined)
      return response.status(400).json({ error: 'URL is required!' })

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
      response.status(400).json({ error: 'malformed id' })
    }
  }
})

blogsRouter.put('/:id', async (request, response) => {
  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    if(request.body.title === undefined)
      return response.status(400).json({ error: 'Title is required!' })

    if(request.body.url === undefined)
      return response.status(400).json({ error: 'URL is required!' })

    const user = await User.findById(decodedToken.id)

    const body = request.body

    const updatedBlog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes || 0,
      user: user._id
    }

    const result = await Blog.findByIdAndUpdate(request.params.id, updatedBlog, { new: true })

    if(result) {
      response.status(200).end()
    } else {
      response.status(404).json({ error: 'Blog not found' })
    }
  } catch(exception) {
    if (exception.name === 'JsonWebTokenError' ) {
      response.status(401).json({ error: exception.message })
    } else {
      response.status(400).json({ error: 'malformed id' })
    }
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