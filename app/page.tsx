'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import { ArticleListItem } from '@/lib/types/article';

const Home = () => {
  const {
    data: articles = [],
    isLoading,
    error,
  } = useQuery<ArticleListItem[]>({
    queryKey: ['articles'],
    queryFn: async () => {
      const response = await fetch('/api/articles');

      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }

      const data = await response.json();

      return data.data || [];
    },
  });

  if (error) {
    return (
      <div className="space-y-8">
        <section className="text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold">Welcome to Giran</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Explore a curated collection of articles on web development,
            covering modern frameworks, tools, and best practices.
          </p>
        </section>
        <section className="text-center">
          <p className="text-red-600 dark:text-red-400">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h2 className="text-3xl sm:text-4xl font-bold">Welcome to Giran</h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          Explore a curated collection of articles on web development, covering
          modern frameworks, tools, and best practices.
        </p>
      </section>

      {/* Articles Grid */}
      <section>
        <h3 className="text-2xl font-semibold mb-6">Articles</h3>
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">
              Loading articles...
            </p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">
              No articles found
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-md overflow-hidden"
              >
                <Link href={`/articles/${article.id}`} className="block">
                  <div className="p-6 space-y-3">
                    <div>
                      <h4 className="text-xl font-semibold hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        {article.title}
                      </h4>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <time className="text-sm text-slate-500 dark:text-slate-500">
                        {new Date(article.createdAt).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          },
                        )}
                      </time>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                        Read →
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
