const mongoose = require('mongoose')
const User = require('./user')

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})

blogSchema.statics.format = blog => {
  return {
    id: blog.id,
    title: blog.title,
    author: blog.author,
    url: blog.url,
    likes: blog.likes,
    user: User.format(blog.user)
  }
}

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog