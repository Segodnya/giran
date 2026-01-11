import { Article, ArticleListItem } from '../types/article';
import { getMockArticles, getMockArticle } from '../mocks/articles';
import { GitHubService } from './github.service';
import { isGitHubEnabled, GITHUB_CONFIG } from '../config';

// Cache for articles with TTL
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  sha?: string;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const articlesCache: Map<string, CacheEntry<ArticleListItem[]>> = new Map();
const articleCache: Map<string, CacheEntry<Article>> = new Map();

let githubService: GitHubService | null = null;

const getGitHubService = () => {
  if (!githubService) {
    githubService = new GitHubService({
      token: GITHUB_CONFIG.token,
    });
  }

  return githubService;
};

const isCacheValid = <T>(cache: CacheEntry<T>, newSha?: string | null): boolean => {
  const ttlValid = Date.now() - cache.timestamp < CACHE_TTL;

  // If we have a new SHA and cached SHA, compare them for invalidation
  if (newSha && cache.sha && newSha !== cache.sha) {
    return false; // Cache is invalid if SHA changed
  }

  return ttlValid;
};

/**
 * Get all articles from GitHub
 */
const getArticlesFromGitHub = async (): Promise<ArticleListItem[]> => {
  const cacheKey = 'articles-list';
  const cached = articlesCache.get(cacheKey);

  const service = getGitHubService();

  // Check for new commits to invalidate cache
  const currentSha = await service.getLastCommitSha(
    GITHUB_CONFIG.owner!,
    GITHUB_CONFIG.repo!,
    GITHUB_CONFIG.folder,
  );

  if (cached && isCacheValid(cached, currentSha)) {
    return cached.data;
  }

  const articles = await service.listArticles(
    GITHUB_CONFIG.owner!,
    GITHUB_CONFIG.repo!,
    GITHUB_CONFIG.folder,
  );

  const articleList = articles.map((article) => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    createdAt: article.createdAt,
  }));

  articlesCache.set(cacheKey, {
    data: articleList,
    timestamp: Date.now(),
    sha: currentSha || undefined,
  });

  return articleList;
};

/**
 * Get a single article from GitHub
 */
const getArticleFromGitHub = async (id: string): Promise<Article | null> => {
  const cacheKey = `article-${id}`;
  const cached = articleCache.get(cacheKey);

  const service = getGitHubService();

  // Check for new commits to invalidate cache
  const filePath = `${GITHUB_CONFIG.folder}/${id}.md`;
  const currentSha = await service.getLastCommitSha(
    GITHUB_CONFIG.owner!,
    GITHUB_CONFIG.repo!,
    filePath,
  );

  if (cached && isCacheValid(cached, currentSha)) {
    return cached.data;
  }

  try {
    const article = await service.getArticle(
      GITHUB_CONFIG.owner!,
      GITHUB_CONFIG.repo!,
      GITHUB_CONFIG.folder,
      id,
    );

    articleCache.set(cacheKey, {
      data: article,
      timestamp: Date.now(),
      sha: currentSha || undefined,
    });

    return article;
  } catch (error) {
    console.error(`Failed to fetch article ${id} from GitHub:`, error);

    return null;
  }
};

/**
 * Get all articles
 * Uses GitHub if enabled, falls back to mock data
 */
export const getArticles = async (): Promise<ArticleListItem[]> => {
  if (isGitHubEnabled()) {
    try {
      return await getArticlesFromGitHub();
    } catch (error) {
      console.error(
        'Failed to fetch articles from GitHub, falling back to mocks:',
        error,
      );
    }
  }

  return getMockArticles().map((article) => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    createdAt: article.createdAt,
  }));
};

/**
 * Get a single article by ID
 * Uses GitHub if enabled, falls back to mock data
 */
export const getArticle = async (id: string): Promise<Article | null> => {
  if (isGitHubEnabled()) {
    try {
      const article = await getArticleFromGitHub(id);

      if (article) {
        return article;
      }
    } catch (error) {
      console.error(
        `Failed to fetch article ${id} from GitHub, falling back to mocks:`,
        error,
      );
    }
  }

  return getMockArticle(id) || null;
};

/**
 * Clear all caches
 * Useful for testing and forcing fresh data
 */
export const clearCache = (): void => {
  articlesCache.clear();
  articleCache.clear();
  githubService = null;
};
