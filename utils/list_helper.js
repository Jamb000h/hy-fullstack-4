const favoriteBlog = blogs => {
  if(blogs.length === 0)
    return {}

  if(blogs.length === 1)
    return blogs[0]

  const sortedBlogs = blogs.sort( (a, b) => {
    return a.likes < b.likes
  })

  return sortedBlogs[0]
}

const totalLikes = blogs => {
  return blogs.reduce( (prev, blog) => {
    return prev + blog.likes
  }, 0)
}

module.exports = {
  favoriteBlog,
  totalLikes
}