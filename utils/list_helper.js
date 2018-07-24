const favoriteBlog = blogs => {
  if(blogs.length === 0)
    return {}

  if(blogs.length === 1) {
    const favoriteBlog = {
      title: blogs[0].title,
      author: blogs[0].author,
      likes: blogs[0].likes
    }
    return favoriteBlog
  }

  const sortedBlogs = blogs.sort( (a, b) => {
    return a.likes < b.likes
  })

  const favoriteBlog = {
    title: sortedBlogs[0].title,
    author: sortedBlogs[0].author,
    likes: sortedBlogs[0].likes
  }

  return favoriteBlog
}

const mostBlogs = blogs => {
  if(blogs.length === 0)
    return {}

  if(blogs.length === 1) {
    const mostBlogs = {
      author: blogs[0].author,
      blogs: 1
    }

    return mostBlogs
  }

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

  if(blogs.length === 1) {
    const mostLikes = {
      author: blogs[0].author,
      likes: blogs[0].likes
    }

    return mostLikes
  }

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