export interface Article {
  id: string;
  title: string;
  slug: string;
  /**
   * Markdown content of the article
   */
  content: string;
  excerpt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  createdAt: string;
}
