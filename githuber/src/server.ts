import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';

import { GitHubService } from './github.service';

export function createServer() {
  const app = new Elysia();
  app.use(cors());

  const githubService = new GitHubService();

  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  const articlesDir = process.env.GITHUB_REPO_FOLDER || '';

  if (!owner || !repo) {
    throw new Error(
      'GitHub repository owner and name must be configured in environment variables.',
    );
  }

  app.get('/articles', async ({ set }) => {
    try {
      const contents = await githubService.getContent(owner, repo, articlesDir);

      return contents.filter(
        (content) => content.type === 'file' && content.name.endsWith('.md'),
      );
    } catch (error) {
      console.error(error);

      set.status = 500;

      return { message: 'Error fetching articles' };
    }
  });

  app.get('/articles/:name', async ({ params, set }) => {
    try {
      const articleName = params.name;
      const articlePath = `${articlesDir}/${articleName}`;

      return await githubService.getFileContent(owner, repo, articlePath);
    } catch (error) {
      console.error(error);

      set.status = 500;

      return { message: 'Error fetching article content' };
    }
  });

  return app;
}
