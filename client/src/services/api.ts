import axios from 'axios';

// In production, use relative URLs since nginx proxies API requests
// In development, connect directly to the server
const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? '' // Relative URL - nginx will proxy /api/* to server:3000
    : 'http://localhost:3000'; // Local development

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export interface Article {
  id: string;
  name: string;
  size?: number;
  type?: string;
}

export interface ArticleContent {
  id: string;
  name: string;
  content: string; // raw markdown
  html: string; // processed HTML
  size: number;
  type: string;
}

/**
 * Fetch all articles from the server
 */
export async function fetchArticles(): Promise<Article[]> {
  try {
    const { data } = await api.get<Article[]>('/api/articles');
    return data;
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    throw new Error('Failed to fetch articles');
  }
}

/**
 * Fetch a specific article by ID with both markdown and HTML content
 */
export async function fetchArticleById(id: string): Promise<ArticleContent> {
  try {
    const { data } = await api.get<ArticleContent>(`/api/articles/${id}`);
    return data;
  } catch (error) {
    console.error(`Failed to fetch article ${id}:`, error);
    throw new Error(`Failed to fetch article ${id}`);
  }
}

/**
 * Format article name for display (remove .md extension and format title)
 */
export function formatArticleTitle(name: string): string {
  return name
    .replace('.md', '')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default api;
