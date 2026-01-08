import { Octokit } from '@octokit/rest';
import pLimit from 'p-limit';
import { z } from 'zod';

import {
  GitHubConfig,
  GitHubRepository,
  GitHubContent,
  GitHubApiError,
  GitHubContentSchema,
  ErrorResponseSchema,
} from '../types/github';
import type { Article } from '../types/article';

export class GitHubService {
  private octokit: Octokit;
  private rateLimiter: ReturnType<typeof pLimit>;
  private requestCount = 0;
  private lastResetTime = Date.now();

  constructor(config: GitHubConfig = {}) {
    const token = config.token || process.env.GITHUB_TOKEN;

    if (!token) {
      console.warn('GitHub token not provided. API requests will be limited.');
    }

    this.octokit = new Octokit({
      auth: token,
      userAgent: config.userAgent || 'GitHub-Service/1.0.0',
      baseUrl: config.baseUrl || 'https://api.github.com',
    });

    // Rate limiter (GitHub allows 5000 requests per hour for authenticated users)
    const rateLimit = config.rateLimit || 60; // requests per minute
    this.rateLimiter = pLimit(rateLimit);
  }

  /**
   * Get repository information
   */
  getRepository = async (
    owner: string,
    repo: string,
  ): Promise<GitHubRepository> => {
    return this.rateLimiter(async () => {
      try {
        this.trackRequest();
        const { data } = await this.octokit.rest.repos.get({ owner, repo });

        return {
          owner: data.owner.login,
          repo: data.name,
          fullName: data.full_name,
          description: data.description,
          private: data.private,
          fork: data.fork,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          pushedAt: data.pushed_at,
          size: data.size,
          stargazersCount: data.stargazers_count,
          watchersCount: data.watchers_count,
          language: data.language,
          forksCount: data.forks_count,
          defaultBranch: data.default_branch,
        };
      } catch (error) {
        throw this.handleError(error);
      }
    });
  };

  /**
   * Get repository content (file or directory)
   */
  getContent = async (
    owner: string,
    repo: string,
    path: string = '',
    ref?: string,
  ): Promise<GitHubContent[]> => {
    return this.rateLimiter(async () => {
      try {
        this.trackRequest();
        const { data } = await this.octokit.rest.repos.getContent({
          owner,
          repo,
          path,
          ref,
        });

        const contents = Array.isArray(data) ? data : [data];

        return z.array(GitHubContentSchema).parse(contents);
      } catch (error) {
        throw this.handleError(error);
      }
    });
  };

  /**
   * Get file content as string (decoded from base64)
   */
  getFileContent = async (
    owner: string,
    repo: string,
    path: string,
    ref?: string,
  ): Promise<string> => {
    const contents = await this.getContent(owner, repo, path, ref);
    const file = contents[0];

    if (!file || file.type !== 'file' || !file.content) {
      throw new GitHubApiError(
        `Path ${path} is not a file or content is not available`,
      );
    }

    if (file.encoding === 'base64') {
      return Buffer.from(file.content, 'base64').toString('utf-8');
    }

    return file.content;
  };

  /**
   * List all markdown articles in a folder
   */
  listArticles = async (
    owner: string,
    repo: string,
    folder: string,
  ): Promise<Article[]> => {
    try {
      const contents = await this.getContent(owner, repo, folder);

      const markdownFiles = contents.filter((item) => {
        return item.type === 'file' && item.name.endsWith('.md');
      });

      // Fetch content for each markdown file
      const articles = await Promise.all(
        markdownFiles.map(async (file) => {
          const content = await this.getFileContent(owner, repo, file.path);
          const id = file.name.replace('.md', '');

          // Extract title from content (first heading) or use filename
          const titleMatch = content.match(/^#\s+(.+)$/m);
          const title = titleMatch ? titleMatch[1] : id;

          // Extract excerpt (first paragraph after title)
          const excerptMatch = content.match(/^(?:#{1,6}\s+.+\n+)?(.+)$/m);
          const excerpt = excerptMatch ? excerptMatch[1].substring(0, 150) : '';

          return {
            id,
            title,
            slug: id,
            content,
            excerpt,
            createdAt: new Date().toISOString(), // GitHub doesn't provide file creation date easily
            updatedAt: new Date().toISOString(),
          };
        }),
      );

      return articles;
    } catch (error) {
      throw this.handleError(error);
    }
  };

  /**
   * Get a single article by file path
   */
  getArticle = async (
    owner: string,
    repo: string,
    folder: string,
    id: string,
  ): Promise<Article> => {
    try {
      const filePath = `${folder}/${id}.md`;
      const content = await this.getFileContent(owner, repo, filePath);

      // Extract title from content (first heading) or use filename
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : id;

      // Extract excerpt (first paragraph after title)
      const excerptMatch = content.match(/^(?:#{1,6}\s+.+\n+)?(.+)$/m);
      const excerpt = excerptMatch ? excerptMatch[1].substring(0, 150) : '';

      return {
        id,
        title,
        slug: id,
        content,
        excerpt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw this.handleError(error);
    }
  };

  /**
   * Normalize and validate error responses
   */
  private handleError = (error: unknown): GitHubApiError => {
    if (error instanceof GitHubApiError) {
      return error;
    }

    const parseResult = ErrorResponseSchema.safeParse(error);

    if (parseResult.success) {
      const message = parseResult.data.message || 'Unknown GitHub API error';
      const status = (error as { status?: number }).status;

      return new GitHubApiError(message, status, parseResult.data);
    }

    const errorObj = error as Record<string, unknown>;
    const message =
      (typeof errorObj?.message === 'string' ? errorObj.message : undefined) ||
      'Unknown GitHub API error';
    const status =
      typeof errorObj?.status === 'number' ? errorObj.status : undefined;

    return new GitHubApiError(message, status);
  };

  /**
   * Track request count for rate limit monitoring
   */
  private trackRequest = (): void => {
    const now = Date.now();
    const timeSinceReset = now - this.lastResetTime;

    // Reset counter every minute
    if (timeSinceReset > 60000) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    this.requestCount++;
  };
}
