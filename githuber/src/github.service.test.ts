import { describe, test, expect } from 'bun:test';
import { GitHubService, GitHubApiError } from './github.service';

describe('GitHubService', () => {
  const githubService = new GitHubService();

  describe('Unit Tests', () => {
    test('Should create instance without token', () => {
      const service = new GitHubService();

      expect(service).toBeInstanceOf(GitHubService);
    });

    test('Should create instance with custom config', () => {
      const service = new GitHubService({
        token: 'test-token',
        userAgent: 'Test-Agent/1.0.0',
        rateLimit: 30,
      });

      expect(service).toBeInstanceOf(GitHubService);
    });

    test('Should get request stats', () => {
      const stats = githubService.getRequestStats();

      expect(typeof stats.count).toBe('number');
      expect(stats.resetTime).toBeInstanceOf(Date);
    });
  });

  describe('Integration Tests', () => {
    test('Should handle non-existent repository error', async () => {
      try {
        await githubService.getRepository(
          'nonexistent-user-12345',
          'nonexistent-repo-12345',
        );

        throw new Error('Expected error for non-existent repository');
      } catch (error) {
        expect(error).toBeInstanceOf(GitHubApiError);
        expect((error as GitHubApiError).status).toBe(404);
      }
    });

    test('Should get public repository info', async () => {
      const repo = await githubService.getRepository('microsoft', 'typescript');

      expect(repo.owner).toBe('microsoft');
      expect(repo.repo).toBe('TypeScript');
      expect(repo.private).toBe(false);
      expect(repo.stargazersCount).toBeGreaterThan(0);
    });

    test('Should get repository content', async () => {
      const contents = await githubService.getContent(
        'microsoft',
        'typescript',
      );

      expect(Array.isArray(contents)).toBe(true);
      expect(contents.length).toBeGreaterThan(0);

      const readmeFile = contents.find(
        (item) => item.name.toLowerCase() === 'readme.md',
      );

      expect(readmeFile).toBeDefined();
      expect(readmeFile?.type).toBe('file');
    });

    test('Should get file content', async () => {
      const content = await githubService.getFileContent(
        'microsoft',
        'typescript',
        'README.md',
      );

      expect(typeof content).toBe('string');
      expect(content.length).toBeGreaterThan(0);
      expect(content).toContain('TypeScript');
    });

    test('Should get repository branches', async () => {
      const branches = await githubService.getBranches(
        'microsoft',
        'typescript',
      );

      expect(Array.isArray(branches)).toBe(true);
      expect(branches.length).toBeGreaterThan(0);

      // Just verify that we have at least one branch with required properties
      const firstBranch = branches[0];

      expect(firstBranch).toBeDefined();
      expect(firstBranch.name).toBeDefined();
      expect(firstBranch.commit).toBeDefined();
    });

    test('Should check if repository is public', async () => {
      const isPublic = await githubService.isRepositoryPublic(
        'microsoft',
        'typescript',
      );

      expect(isPublic).toBe(true);
    });

    test('Should search repositories', async () => {
      const results = await githubService.searchRepositories('typescript', {
        sort: 'stars',
        order: 'desc',
        perPage: 5,
      });

      expect(Array.isArray(results.repositories)).toBe(true);
      expect(results.totalCount).toBeGreaterThan(0);
      expect(results.repositories.length).toBeLessThanOrEqual(5);

      // First result should have high star count due to sorting
      if (results.repositories.length > 0) {
        expect(results.repositories[0].stargazersCount).toBeGreaterThan(1000);
      }
    });

    test('Should get rate limit status', async () => {
      const rateLimit = await githubService.getRateLimit();

      expect(typeof rateLimit.rate.limit).toBe('number');
      expect(typeof rateLimit.rate.remaining).toBe('number');
      expect(rateLimit.rate.remaining).toBeGreaterThanOrEqual(0);
    });
  });
});
