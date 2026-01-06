import { describe, expect, it, beforeEach, mock } from 'bun:test';

import { createServer } from './server';

const mockedGetArticles = mock(
  (): Promise<Array<{ id: string; title: string }>> => Promise.resolve([]),
);

const mockedGetArticle = mock(
  (): Promise<{ id: string; title: string; content: string }> =>
    Promise.resolve({ id: '', title: '', content: '' }),
);

mock.module('./githuber.service', () => ({
  getArticles: mockedGetArticles,
  getArticle: mockedGetArticle,
}));

describe('API Endpoints', () => {
  const app = createServer();

  beforeEach(() => {
    mockedGetArticles.mockClear();
    mockedGetArticle.mockClear();
  });

  describe('GET /', () => {
    it('should return 200 OK with a message', async () => {
      const response = await app
        .handle(new Request('http://localhost/'))
        .then((res) => res);

      expect(response.status).toBe(200);
      expect(await response.text()).toBe('Server is running!');
    });
  });

  describe('GET /api/articles', () => {
    it('should return a list of articles', async () => {
      const articles = [{ id: '1', title: 'Test Article' }];
      mockedGetArticles.mockResolvedValue(articles);

      const response = await app.handle(
        new Request('http://localhost/api/articles'),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(articles);
    });

    it('should return 500 if the service throws an error', async () => {
      mockedGetArticles.mockRejectedValue(new Error('Service error'));

      const response = await app.handle(
        new Request('http://localhost/api/articles'),
      );

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/articles/:id', () => {
    it('should return a single article', async () => {
      const article = {
        id: '1',
        title: 'Test Article',
        content: 'Hello World',
      };

      mockedGetArticle.mockResolvedValue(article);

      const response = await app.handle(
        new Request('http://localhost/api/articles/1'),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(article);
    });

    it('should return 500 if article not found', async () => {
      mockedGetArticle.mockRejectedValue(new Error('Article not found'));

      const response = await app.handle(
        new Request('http://localhost/api/articles/not-found'),
      );

      expect(response.status).toBe(500);
    });
  });
});
