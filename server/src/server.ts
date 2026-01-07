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

  app.get('/api/articles/:id/html', async ({ params, set }) => {
    try {
      const article = await getArticle(params.id);

      const formatTitle = (name: string) =>
        name
          .replace('.md', '')
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

      const html = `
        <article class="prose prose-lg max-w-none">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h1 class="text-4xl font-bold mb-2">${formatTitle(
                article.name,
              )}</h1>
              <div class="flex gap-2 text-sm text-[var(--bc)] opacity-70">
                <span class="badge badge-outline">${Math.round(
                  article.size / 1024,
                )} KB</span>
                <span class="badge badge-outline">Markdown</span>
              </div>
            </div>
            <button class="btn btn-sm btn-ghost" onclick="document.getElementById('article-content').classList.add('hidden')">
              ✕ Close
            </button>
          </div>
          <div class="divider"></div>
          <div class="markdown-content">${article.html}</div>
        </article>
        <script>
          if (typeof window !== 'undefined' && window.hljs) {
            window.hljs.highlightAll();
          }
        </script>
      `;

      return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    } catch (error) {
      console.error(error);

      set.status = 500;

      return new Response(
        '<div class="alert alert-error">Failed to load article</div>',
        {
          headers: { 'Content-Type': 'text/html' },
        },
      );
    }
  });

  return app;
}
