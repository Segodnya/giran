import { Article, ArticleListItem } from '../types/article';
import { getMockArticles, getMockArticle } from '../mocks/articles';

/**
 * Get all articles
 * Currently returns mock data
 * Will be replaced with GitHub service integration in Phase 3
 */
export const getArticles = async (): Promise<ArticleListItem[]> => {
  // In Phase 3, this will check if GitHub is enabled and fetch from GitHub
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
 * Currently returns mock data
 * Will be replaced with GitHub service integration in Phase 3
 */
export const getArticle = async (id: string): Promise<Article | null> => {
  // In Phase 3, this will check if GitHub is enabled and fetch from GitHub
  return getMockArticle(id) || null;
};
