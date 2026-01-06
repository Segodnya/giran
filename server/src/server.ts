import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';

import { getArticle, getArticles } from './githuber.service';

export function createServer() {
  const app = new Elysia();
  app.use(cors());

  app.get('/', () => {
    return 'Server is running!';
  });

  app.get('/api/articles', async ({ set }) => {
    try {
      return await getArticles();
    } catch (error) {
      console.error(error);

      set.status = 500;

      return { message: 'Error fetching articles' };
    }
  });

  app.get('/api/articles/:id', async ({ params, set }) => {
    try {
      return await getArticle(params.id);
    } catch (error) {
      console.error(error);

      set.status = 500;

      return { message: 'Error fetching article' };
    }
  });

  return app;
}
