const listHelper = require('../utils/list_helper')
const { initialBlogs } = require('./test_helper')

const singleBlog = [
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0
  }
]

describe('total likes', () => {

  test('of empty list is zero', () => {
    const result = listHelper.totalLikes([])

    expect(result).toBe(0)
  })

  test('of a single item is correct', () => {
    const result = listHelper.totalLikes(singleBlog)

    expect(result).toBe(12)
  })

  test('of multiple items is correct', () => {
    const result = listHelper.totalLikes(initialBlogs)

    expect(result).toBe(36)
  })

})

describe('favorite blog', () => {
  test('of empty list is an empty object', () => {
    const result = listHelper.favoriteBlog([])

    expect(result).toEqual({})
  })

  test('of a single item is the same item', () => {
    const result = listHelper.favoriteBlog(singleBlog)

    expect(result).toEqual({
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      likes: 12
    })
  })

  test('of multiple items is correct', () => {
    const result = listHelper.favoriteBlog(initialBlogs)

    expect(result).toEqual(
      {
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        likes: 12
      }
    )

  })
})

describe('most blogs', () => {
  test('of empty list is an empty object', () => {
    const result = listHelper.mostBlogs([])

    expect(result).toEqual({})
  })

  test('of a single item is the same item', () => {
    const result = listHelper.mostBlogs(singleBlog)

    expect(result).toEqual({
      author: 'Edsger W. Dijkstra',
      blogs: 1
    })
  })

  test('of multiple items is correct', () => {
    const result = listHelper.mostBlogs(initialBlogs)

    expect(result).toEqual(
      {
        author: 'Robert C. Martin',
        blogs: 3
      }
    )
  })
})

describe('most likes', () => {
  test('of empty list is an empty object', () => {
    const result = listHelper.mostLikes([])

    expect(result).toEqual({})
  })

  test('of a single item is the same item', () => {
    const result = listHelper.mostLikes(singleBlog)

    expect(result).toEqual({
      author: 'Edsger W. Dijkstra',
      likes: 12
    })
  })

  test('of multiple items is correct', () => {
    const result = listHelper.mostLikes(initialBlogs)

    expect(result).toEqual(
      {
        author: 'Edsger W. Dijkstra',
        likes: 17
      }
    )
  })
})