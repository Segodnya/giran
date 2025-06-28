import request from 'supertest'
import { app } from '../index'
import * as githuber from '../services/githuber'

jest.mock('../services/githuber')

const mockedGetArticles = githuber.getArticles as jest.Mock
const mockedGetArticle = githuber.getArticle as jest.Mock

describe('API Endpoints', () => {
  beforeEach(() => {
    mockedGetArticles.mockClear()
    mockedGetArticle.mockClear()
  })

  describe('GET /', () => {
    it('should return 200 OK with a message', async () => {
      const response = await request(app).get('/')
      expect(response.status).toBe(200)
      expect(response.text).toBe('Server is running!')
    })
  })

  describe('GET /api/articles', () => {
    it('should return a list of articles', async () => {
      const articles = [{ id: '1', title: 'Test Article' }]
      mockedGetArticles.mockResolvedValue(articles)

      const response = await request(app).get('/api/articles')
      expect(response.status).toBe(200)
      expect(response.body).toEqual(articles)
    })

    it('should return 500 if the service throws an error', async () => {
      mockedGetArticles.mockRejectedValue(new Error('Service error'))

      const response = await request(app).get('/api/articles')
      expect(response.status).toBe(500)
    })
  })

  describe('GET /api/articles/:id', () => {
    it('should return a single article', async () => {
      const article = { id: '1', title: 'Test Article', content: 'Hello World' }
      mockedGetArticle.mockResolvedValue(article)

      const response = await request(app).get('/api/articles/1')
      expect(response.status).toBe(200)
      expect(response.body).toEqual(article)
    })

    it('should return 500 if article not found', async () => {
      mockedGetArticle.mockRejectedValue(new Error('Article not found'))

      const response = await request(app).get('/api/articles/not-found')
      expect(response.status).toBe(500)
    })
  })
})
