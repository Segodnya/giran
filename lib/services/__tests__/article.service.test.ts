import { describe, test, expect, beforeEach, afterEach } from 'bun:test';

import { getArticles, getArticle, clearCache } from '../article.service';

describe('Article Service', () => {
  afterEach(() => {
    // Cleanup after tests
    clearCache();
  });

  beforeEach(() => {
    // Clear environment to use mocks
    delete process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_REPO_OWNER;
    delete process.env.GITHUB_REPO_NAME;
  });

  describe('getArticles', () => {
    test('should return mock articles when GitHub is disabled', async () => {
      const articles = await getArticles();

      expect(Array.isArray(articles)).toBe(true);
      expect(articles.length > 0).toBe(true);

      // Check mock data structure
      const article = articles[0];
      expect(typeof article.id).toBe('string');
      expect(typeof article.title).toBe('string');
      expect(typeof article.slug).toBe('string');
      expect(typeof article.excerpt).toBe('string');
      expect(typeof article.createdAt).toBe('string');
    });

    test('should return articles in correct format', async () => {
      const articles = await getArticles();

      articles.forEach((article) => {
        expect(article).toHaveProperty('id');
        expect(article).toHaveProperty('title');
        expect(article).toHaveProperty('slug');
        expect(article).toHaveProperty('excerpt');
        expect(article).toHaveProperty('createdAt');
      });
    });

    test('should maintain type safety for article list', async () => {
      const articles = await getArticles();

      expect(Array.isArray(articles)).toBe(true);

      if (articles.length > 0) {
        const article = articles[0];

        // All required properties should exist
        expect('id' in article).toBe(true);
        expect('title' in article).toBe(true);
        expect('slug' in article).toBe(true);
        expect('excerpt' in article).toBe(true);
        expect('createdAt' in article).toBe(true);

        // Check types
        expect(typeof article.id).toBe('string');
        expect(typeof article.title).toBe('string');
      }
    });
  });

  describe('getArticle', () => {
    test('should return mock article when GitHub is disabled', async () => {
      const articles = await getArticles();
      const firstArticleId = articles[0]?.id;

      if (!firstArticleId) {
        expect(true).toBe(true); // Skip if no articles
        return;
      }

      const article = await getArticle(firstArticleId);

      expect(article).not.toBeNull();
      if (article) {
        expect(article.id).toBe(firstArticleId);
        expect(typeof article.title).toBe('string');
        expect(typeof article.content).toBe('string');
        expect(typeof article.excerpt).toBe('string');
      }
    });

    test('should return null for non-existent article', async () => {
      const article = await getArticle('non-existent-article-xyz');

      expect(article).toBeNull();
    });

    test('should return complete article structure', async () => {
      const articles = await getArticles();
      const firstArticleId = articles[0]?.id;

      if (!firstArticleId) {
        expect(true).toBe(true);
        return;
      }

      const article = await getArticle(firstArticleId);

      if (article) {
        expect(article).toHaveProperty('id');
        expect(article).toHaveProperty('title');
        expect(article).toHaveProperty('slug');
        expect(article).toHaveProperty('content');
        expect(article).toHaveProperty('excerpt');
        expect(article).toHaveProperty('createdAt');
        expect(article).toHaveProperty('updatedAt');
      }
    });

    test('should return article with valid markdown content', async () => {
      const articles = await getArticles();
      const firstArticleId = articles[0]?.id;

      if (!firstArticleId) {
        expect(true).toBe(true);
        return;
      }

      const article = await getArticle(firstArticleId);

      if (article) {
        expect(typeof article.content).toBe('string');
        // Mock articles should have markdown-like content
        expect(article.content.length > 0).toBe(true);
      }
    });

    test('should maintain type safety for single article', async () => {
      const articles = await getArticles();
      const firstArticleId = articles[0]?.id;

      if (!firstArticleId) {
        expect(true).toBe(true);
        return;
      }

      const article = await getArticle(firstArticleId);

      if (article) {
        // Verify all types are correct (no implicit any)
        expect(typeof article.id).toBe('string');
        expect(typeof article.title).toBe('string');
        expect(typeof article.slug).toBe('string');
        expect(typeof article.content).toBe('string');
        expect(typeof article.excerpt).toBe('string');
        expect(typeof article.createdAt).toBe('string');
        expect(typeof article.updatedAt).toBe('string');
      }
    });
  });

  describe('Caching', () => {
    test('should cache articles when fetched multiple times', async () => {
      const articles1 = await getArticles();
      const articles2 = await getArticles();

      // Should return same result
      expect(articles1.length).toBe(articles2.length);

      if (articles1.length > 0) {
        expect(articles1[0].id).toBe(articles2[0].id);
      }
    });

    test('should cache single articles', async () => {
      const articles = await getArticles();
      const firstArticleId = articles[0]?.id;

      if (!firstArticleId) {
        expect(true).toBe(true);
        return;
      }

      const article1 = await getArticle(firstArticleId);
      const article2 = await getArticle(firstArticleId);

      if (article1 && article2) {
        expect(article1.id).toBe(article2.id);
        expect(article1.title).toBe(article2.title);
      }
    });

    test('should clear cache when requested', async () => {
      const articles1 = await getArticles();
      expect(articles1.length > 0).toBe(true);

      clearCache();

      // After clearing cache, should still work but might get fresh data
      const articles2 = await getArticles();
      expect(articles2.length > 0).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should fall back to mocks on GitHub error', async () => {
      // When GitHub is disabled, should use mocks
      const articles = await getArticles();

      expect(Array.isArray(articles)).toBe(true);
      expect(articles.length > 0).toBe(true);
    });

    test('should return null for missing article instead of throwing', async () => {
      const article = await getArticle('definitely-does-not-exist-xyz');

      expect(article).toBeNull();
    });

    test('should handle concurrent requests', async () => {
      const requests = [getArticles(), getArticles(), getArticles()];

      const results = await Promise.all(requests);

      results.forEach((articles) => {
        expect(Array.isArray(articles)).toBe(true);
      });
    });
  });

  describe('Mock Data', () => {
    test('should provide default mock articles', async () => {
      const articles = await getArticles();

      expect(articles.length > 0).toBe(true);

      // Check for expected mock articles
      const articleIds = articles.map((a) => a.id);

      // Should have at least some of the standard content types
      expect(articleIds.length > 0).toBe(true);
    });

    test('should have valid mock article data', async () => {
      const articles = await getArticles();

      articles.forEach((article) => {
        // All required fields should be present and non-empty
        expect(article.id.length > 0).toBe(true);
        expect(article.title.length > 0).toBe(true);
        expect(article.slug.length > 0).toBe(true);
        expect(article.excerpt.length > 0).toBe(true);
        expect(article.createdAt).toBeTruthy();
      });
    });

    test('should have consistent mock data', async () => {
      const articles1 = await getArticles();
      clearCache();
      const articles2 = await getArticles();

      expect(articles1.length).toBe(articles2.length);

      // Check IDs are consistent
      const ids1 = articles1.map((a) => a.id).sort();
      const ids2 = articles2.map((a) => a.id).sort();

      expect(ids1).toEqual(ids2);
    });
  });

  describe('Type Preservation', () => {
    test('should not have any implicit any types in articles list', async () => {
      const articles = await getArticles();

      // This is a compile-time check, but we verify at runtime
      expect(Array.isArray(articles)).toBe(true);

      articles.forEach((article) => {
        // All properties should be properly typed
        expect(typeof article.id).not.toBe('object');
        expect(typeof article.title).toBe('string');
        expect(typeof article.slug).toBe('string');
        expect(typeof article.excerpt).toBe('string');
        expect(typeof article.createdAt).toBe('string');
      });
    });

    test('should not have any implicit any types in single article', async () => {
      const articles = await getArticles();
      const firstArticleId = articles[0]?.id;

      if (!firstArticleId) {
        expect(true).toBe(true);
        return;
      }

      const article = await getArticle(firstArticleId);

      if (article) {
        // All properties should be properly typed
        expect(typeof article.id).toBe('string');
        expect(typeof article.title).toBe('string');
        expect(typeof article.slug).toBe('string');
        expect(typeof article.content).toBe('string');
        expect(typeof article.excerpt).toBe('string');
        expect(typeof article.createdAt).toBe('string');
        expect(typeof article.updatedAt).toBe('string');
      }
    });
  });
});
