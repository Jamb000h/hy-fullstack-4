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

const mostBlogs = blogs => {
  if(blogs.length === 0)
    return {}

  if(blogs.length === 1)
    return blogs[0]

  const authorPosts = []

  blogs.map( blog => {
    const author = authorPosts.find( author => author.author === blog.author)

    author ? author.blogs++ : authorPosts.push( { author: blog.author, blogs: 1 } )
  })

  const sortedAuthorPosts = authorPosts.sort( (a, b) => {
    return a.blogs < b.blogs
  })

  return sortedAuthorPosts[0]
}

const mostLikes = blogs => {
  if(blogs.length === 0)
    return {}

  if(blogs.length === 1)
    return blogs[0]

  const authorPosts = []

  blogs.map( blog => {
    const author = authorPosts.find( author => author.author === blog.author)

    author ?
      author.likes += blog.likes :
      authorPosts.push( { author: blog.author, likes: blog.likes } )
  })

  const sortedAuthorPosts = authorPosts.sort( (a, b) => {
    return a.likes < b.likes
  })

  return sortedAuthorPosts[0]
}

const totalLikes = blogs => {
  return blogs.reduce( (prev, blog) => {
    return prev + blog.likes
  }, 0)
}

module.exports = {
  favoriteBlog,
  mostBlogs,
  mostLikes,
  totalLikes
}