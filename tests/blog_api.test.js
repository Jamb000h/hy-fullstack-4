const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const { initialBlogs, nonExistingId, blogsInDb, usersInDb, hashPassword, validateJWT } = require('./test_helper')

describe('/api/login', async () => {

  beforeAll(async () => {
    await User.remove({})
    const user = new User({
      username: 'root',
      passwordHash: await hashPassword('sekret'),
      name: 'test-name',
      adult: false
    })
    await user.save()
  })

  describe('POST /api/login', async () => {

    test('a valid user can log in', async () => {
      const loginUser = {
        username: 'root',
        password: 'sekret'
      }

      await api
        .post('/api/login')
        .send(loginUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })

    test('an invalid user cannot log in', async () => {
      const loginUser = {
        username: 'root',
        password: 'wrongsekret'
      }

      await api
        .post('/api/login')
        .send(loginUser)
        .expect(401)
        .expect('Content-Type', /application\/json/)
    })

    test('a valid JWT is issued on successful login', async () => {
      const loginUser = {
        username: 'root',
        password: 'sekret'
      }

      const result = await api
        .post('/api/login')
        .send(loginUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const decodedToken = await validateJWT(result.body.token)

      expect(decodedToken.username).toBe(loginUser.username)
    })

  })

})

describe('/api/blogs', async () => {

  let token
  let token2

  beforeAll(async () => {
    await User.remove({})
    const user = new User({
      username: 'root',
      passwordHash: await hashPassword('sekret'),
      name: 'test-name',
      adult: false
    })
    await user.save()

    const loginUser = {
      username: 'root',
      password: 'sekret'
    }

    const result = await api
      .post('/api/login')
      .send(loginUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    token = result.body.token

    const user2 = new User({
      username: 'root2',
      passwordHash: await hashPassword('sekret2'),
      name: 'test-name2',
      adult: false
    })
    await user2.save()

    const loginUser2 = {
      username: 'root2',
      password: 'sekret2'
    }

    const result2 = await api
      .post('/api/login')
      .send(loginUser2)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    token2 = result2.body.token

    const decodedToken = await validateJWT(result.body.token)

    await Blog.remove({})

    const blogsWithUsers = initialBlogs.map(blog => {
      return { ...blog, user: decodedToken.id }
    })

    const blogObjects = blogsWithUsers.map( blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })

  describe('GET /api/blogs', async () => {
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

    test('individual blogs are returned as json', async () => {
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

  describe('POST /api/blogs', async () => {
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
        .set('Authorization', 'Bearer ' + token)
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
        .set('Authorization', 'Bearer ' + token)
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
        .set('Authorization', 'Bearer ' + token)
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
        .set('Authorization', 'Bearer ' + token)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const blogsInDatabaseAfterOperation = await blogsInDb()
      expect(blogsInDatabaseAfterOperation.length).toBe(blogsInDatabase.length)
    })
  })

  describe('PUT /api/blogs', async () => {
    test('a valid blog can be updated', async () => {

      const blogsInDatabase = await blogsInDb()

      const updatedBlog = { ...blogsInDatabase[0], likes: 777 }

      await api
        .put(`/api/blogs/${updatedBlog.id}`)
        .send(updatedBlog)
        .set('Authorization', 'Bearer ' + token)
        .expect(200)

      const blogsInDatabaseAfter = await blogsInDb()

      const blogsInDatabaseAfterWithoutUsers = blogsInDatabaseAfter.map( blog => {
        return delete blog.user
      })

      expect(blogsInDatabaseAfterWithoutUsers.length).toBe(blogsInDatabase.length)
      expect(blogsInDatabaseAfterWithoutUsers).toContainEqual(delete updatedBlog.user)
    })

    test('a blog without title returns bad request', async () => {

      const blogsInDatabase = await blogsInDb()

      const updatedBlog = { ...blogsInDatabase[0], likes: 777 }

      delete updatedBlog.title

      await api
        .put(`/api/blogs/${updatedBlog.id}`)
        .send(updatedBlog)
        .set('Authorization', 'Bearer ' + token)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const blogsInDatabaseAfterOperation = await blogsInDb()
      expect(blogsInDatabaseAfterOperation.length).toBe(blogsInDatabase.length)
    })

    test('a blog without url returns bad request', async () => {

      const blogsInDatabase = await blogsInDb()

      const updatedBlog = { ...blogsInDatabase[0], likes: 777 }

      delete updatedBlog.url

      await api
        .put(`/api/blogs/${updatedBlog.id}`)
        .send(updatedBlog)
        .set('Authorization', 'Bearer ' + token)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const blogsInDatabaseAfterOperation = await blogsInDb()
      expect(blogsInDatabaseAfterOperation.length).toBe(blogsInDatabase.length)
    })

    test('404 returned with nonexisting id', async () => {
      const validNonexistingId = await nonExistingId()

      const blogsInDatabase = await blogsInDb()

      const updatedBlog = { ...blogsInDatabase[0], likes: 777 }

      await api
        .put(`/api/blogs/${validNonexistingId}`)
        .send(updatedBlog)
        .set('Authorization', 'Bearer ' + token)
        .expect(404)
    })

    test('400 returned with malformed id', async () => {
      const invalidId = 'jonnekanervaheippahei'

      const blogsInDatabase = await blogsInDb()

      const updatedBlog = { ...blogsInDatabase[0], likes: 777 }

      await api
        .put(`/api/blogs/${invalidId}`)
        .send(updatedBlog)
        .set('Authorization', 'Bearer ' + token)
        .expect(400)
    })

  })

  describe('DELETE /api/blogs', async () => {
    test('a blog can be removed', async () => {

      const blogsInDatabase = await blogsInDb()

      const blogToRemove = blogsInDatabase[0]

      await api
        .delete(`/api/blogs/${blogToRemove.id}`)
        .set('Authorization', 'Bearer ' + token)
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
        .set('Authorization', 'Bearer ' + token)
        .expect(404)
    })

    test('400 returned with malformed id', async () => {
      const invalidId = 'jonnekanervaheippahei'

      await api
        .delete(`/api/blogs/${invalidId}`)
        .set('Authorization', 'Bearer ' + token)
        .expect(400)
    })

    test('401 and correct error on invalid user deleting', async () => {
      const blogsInDatabase = await blogsInDb()

      const blogToRemove = blogsInDatabase[0]

      const result = await api
        .delete(`/api/blogs/${blogToRemove.id}`)
        .set('Authorization', 'Bearer ' + token2)
        .expect(401)

      expect(result.body).toEqual({ error: 'You cannot remove blogs made by other people' })

      const blogsInDatabaseAfterOperation = await blogsInDb()

      expect(blogsInDatabaseAfterOperation.length).toBe(blogsInDatabase.length)
    })

    test('400 returned with malformed id', async () => {
      const invalidId = 'jonnekanervaheippahei'

      await api
        .delete(`/api/blogs/${invalidId}`)
        .set('Authorization', 'Bearer ' + token)
        .expect(400)
    })
  })
})

describe('/api/users', async () => {

  beforeAll(async () => {
    await User.remove({})
    const user = new User({
      username: 'root',
      password: 'sekret',
      name: 'test-name',
      adult: false
    })
    await user.save()
  })

  describe('GET /api/users', async () => {
    test('users are returned as json', async () => {
      await api
        .get('/api/users')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })

    test('all users are returned as json', async () => {
      const usersBeforeOperation = await usersInDb()

      const response = await api
        .get('/api/users')
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(response.body.length).toBe(usersBeforeOperation.length)

      usersBeforeOperation.forEach(user => {
        expect(JSON.parse(JSON.stringify(response.body))).toContainEqual(JSON.parse(JSON.stringify(user)))
      })
    })
  })

  describe('POST /api/users', async () => {

    test('creating succeeds with a fresh username', async () => {
      const usersBeforeOperation = await usersInDb()

      const newUser = {
        username: 'root2',
        name: 'test-user',
        password: 'sekret',
        adult: false
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const usersAfterOperation = await usersInDb()
      expect(usersAfterOperation.length).toBe(usersBeforeOperation.length+1)
      const usernames = usersAfterOperation.map(u => u.username)
      expect(usernames).toContain(newUser.username)
    })

    test('adult is set to true if omitted', async () => {
      const usersBeforeOperation = await usersInDb()

      const newUser = {
        username: 'root3',
        name: 'test-user',
        password: 'sekret'
      }

      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(response.body.adult).toBe(true)

      const usersAfterOperation = await usersInDb()
      expect(usersAfterOperation.length).toBe(usersBeforeOperation.length+1)
    })

    test('creating fails with a duplicate username', async () => {
      const usersBeforeOperation = await usersInDb()

      const newUser = {
        username: 'root',
        name: 'test-user',
        password: 'sekret'
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(result.body).toEqual({ error: 'username must be unique' })

      const usersAfterOperation = await usersInDb()
      expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
    })

    test('creating fails with too short password', async () => {
      const usersBeforeOperation = await usersInDb()

      const newUser = {
        username: 'root',
        name: 'test-user',
        password: 'se'
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(result.body).toEqual({ error: 'minimum password length is 3 characters' })

      const usersAfterOperation = await usersInDb()
      expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
    })

  })

})

afterAll(() => {
  server.close()
})