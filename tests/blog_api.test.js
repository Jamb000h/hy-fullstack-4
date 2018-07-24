const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const { initialBlogs, nonExistingId, blogsInDb } = require('./test_helper')

beforeAll(async () => {
  await Blog.remove({})

  const blogObjects = initialBlogs.map( blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)

})

describe('GET /api/blogs', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned as json', async () => {
    const blogsInDatabase = await blogsInDb()

    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.length).toBe(blogsInDatabase.length)

    blogsInDatabase.forEach(blog => {
      expect(response.body).toContainEqual(blog)
    })
  })

  test('individual notes are returned as json', async () => {
    const blogsInDatabase = await blogsInDb()
    const aBlog = blogsInDatabase[0]

    const response = await api
      .get(`/api/blogs/${aBlog.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toEqual(aBlog)
  })

  test('404 returned with nonexisting id', async () => {
    const validNonexistingId = await nonExistingId()

    await api
      .get(`/api/blogs/${validNonexistingId}`)
      .expect(404)
  })

  test('400 returned with malformed id', async () => {
    const invalidId = 'jonnekanervaheippahei'

    await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400)
  })
})

describe('POST /api/blogs', () => {
  test('a valid blog can be added', async () => {

    const blogsInDatabase = await blogsInDb()

    const newBlog = {
      title: 'Canonical string reduction uusi',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 0
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsInDatabaseAfterOperation = await blogsInDb()

    expect(blogsInDatabaseAfterOperation.length).toBe(blogsInDatabase.length + 1)

    const titles = blogsInDatabaseAfterOperation.map(blog => blog.title)
    expect(titles).toContain(newBlog.title)
  })

  test('a valid blog without likes has likes set to zero', async () => {

    const newBlog = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html'
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(response.body.likes).toBe(0)
  })

  test('a blog without title returns bad request', async () => {

    const blogsInDatabase = await blogsInDb()

    const newBlog = {
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 55
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const blogsInDatabaseAfterOperation = await blogsInDb()
    expect(blogsInDatabaseAfterOperation.length).toBe(blogsInDatabase.length)
  })

  test('a blog without url returns bad request', async () => {

    const blogsInDatabase = await blogsInDb()

    const newBlog = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      likes: 15
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const blogsInDatabaseAfterOperation = await blogsInDb()
    expect(blogsInDatabaseAfterOperation.length).toBe(blogsInDatabase.length)
  })
})

describe('DELETE /api/blogs', () => {
  test('a blog can be removed', async () => {

    const blogsInDatabase = await blogsInDb()

    const blogToRemove = blogsInDatabase[0]

    await api
      .delete(`/api/blogs/${blogToRemove.id}`)
      .expect(204)

    const blogsInDatabaseAfterOperation = await blogsInDb()

    expect(blogsInDatabaseAfterOperation.length).toBe(blogsInDatabase.length - 1)

    const titles = blogsInDatabaseAfterOperation.map(blog => blog.title)
    expect(titles).not.toContain(blogToRemove.title)
  })

  test('404 returned with nonexisting id', async () => {
    const validNonexistingId = await nonExistingId()

    await api
      .delete(`/api/blogs/${validNonexistingId}`)
      .expect(404)
  })

  test('400 returned with malformed id', async () => {
    const invalidId = 'jonnekanervaheippahei'

    await api
      .delete(`/api/blogs/${invalidId}`)
      .expect(400)
  })
})

afterAll(() => {
  server.close()
})