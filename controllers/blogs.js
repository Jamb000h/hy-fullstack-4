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
    if(request.body.title === undefined)
      return response.status(400).json({ error: 'Title is required!' })

    if(request.body.url === undefined)
      return response.status(400).json({ error: 'URL is required!' })

    if(request.body.likes === undefined)
      request.body.likes = 0

    const users = await User.find({})

    const user = users[0]

    request.body.user = users[0].id

    const blog = new Blog(request.body)

    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(Blog.format(savedBlog))
  } catch (e) {
    response.status(500).json({ error: 'Something went wrong' })
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