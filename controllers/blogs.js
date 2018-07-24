const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  if(request.body.title === undefined)
    return response.status(400).json( { error: 'Title is required!' } )

  if(request.body.url === undefined)
    return response.status(400).json( { error: 'URL is required!' } )

  if(request.body.likes === undefined)
    request.body.likes = 0

  const blog = new Blog(request.body)

  const savedBlog = await blog.save()

  response.status(201).json(savedBlog)
})

module.exports = blogsRouter