'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { Article } from '@/lib/types/article';

interface ArticleWithHtml extends Article {
  html?: string;
}

const ArticlePage = () => {
  const params = useParams();
  const id = params?.id as string;

  const {
    data: article,
    isLoading,
    error,
  } = useQuery<ArticleWithHtml | null>({
    queryKey: ['article', id],
    queryFn: async () => {
      if (!id) {
        return null;
      }

      const response = await fetch(`/api/articles/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Article not found');
        }

        throw new Error('Failed to fetch article');
      }

      const data = await response.json();

      return data.data || null;
    },
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">Loading article...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="space-y-8">
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Articles
          </Link>
        </nav>
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">
            {error instanceof Error ? error.message : 'Article not found'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium mt-4"
          >
            ← Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Articles
        </Link>
        <span className="text-slate-400">/</span>
        <span className="text-slate-600 dark:text-slate-400">
          {article.title}
        </span>
      </nav>

      {/* Article Header */}
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold">{article.title}</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-600 dark:text-slate-400">
          <time>
            Published on{' '}
            {new Date(article.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          {article.updatedAt !== article.createdAt && (
            <>
              <span className="hidden sm:inline">•</span>
              <time>
                Updated{' '}
                {new Date(article.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </>
          )}
        </div>
      </div>

      {/* Article Content */}
      <article className="prose prose-slate dark:prose-invert max-w-none">
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
          {article.html ? (
            <div
              className="prose prose-slate dark:prose-invert max-w-none
                prose-h1:text-4xl prose-h1:font-bold prose-h1:mt-8 prose-h1:mb-6
                prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4
                prose-h3:text-2xl prose-h3:font-bold prose-h3:mt-6 prose-h3:mb-3
                prose-h4:text-xl prose-h4:font-bold prose-h4:mt-6 prose-h4:mb-2
                prose-h5:text-lg prose-h5:font-bold prose-h5:mt-4 prose-h5:mb-2
                prose-h6:text-base prose-h6:font-bold prose-h6:mt-4 prose-h6:mb-2
                prose-p:text-slate-700 dark:prose-p:text-slate-300
                prose-p:leading-relaxed prose-p:mb-4
                prose-strong:font-bold prose-strong:text-slate-900 dark:prose-strong:text-slate-100
                prose-em:italic prose-em:text-slate-800 dark:prose-em:text-slate-200
                prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:underline
                prose-code:bg-slate-100 dark:prose-code:bg-slate-800
                prose-code:text-red-600 dark:prose-code:text-red-400
                prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                prose-code:font-mono
                prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800
                prose-pre:border prose-pre:border-slate-300 dark:prose-pre:border-slate-700
                prose-pre:rounded prose-pre:p-4 prose-pre:overflow-x-auto
                prose-blockquote:border-l-4 prose-blockquote:border-slate-300
                dark:prose-blockquote:border-slate-700 prose-blockquote:pl-4
                prose-blockquote:italic prose-blockquote:text-slate-700
                dark:prose-blockquote:text-slate-300
                prose-ul:list-disc prose-ul:list-inside prose-ul:space-y-2
                prose-ol:list-decimal prose-ol:list-inside prose-ol:space-y-2
                prose-li:text-slate-700 dark:prose-li:text-slate-300
                prose-table:border prose-table:border-slate-300
                dark:prose-table:border-slate-700 prose-table:w-full
                prose-th:bg-slate-100 dark:prose-th:bg-slate-800
                prose-th:p-2 prose-th:text-left
                prose-td:border prose-td:border-slate-300
                dark:prose-td:border-slate-700 prose-td:p-2
                prose-hr:border-slate-300 dark:prose-hr:border-slate-700
              "
              dangerouslySetInnerHTML={{ __html: article.html }}
            />
          ) : (
            <div className="space-y-6 leading-relaxed text-base sm:text-lg">
              {article.content.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('#')) {
                  // Handle headers
                  const level = paragraph.match(/^#+/)?.[0].length || 1;
                  const text = paragraph.replace(/^#+\s/, '');
                  const headingClass =
                    level === 1
                      ? 'text-3xl font-bold'
                      : level === 2
                      ? 'text-2xl font-bold'
                      : 'text-xl font-bold';

                  return (
                    <h2 key={index} className={`mt-8 ${headingClass}`}>
                      {text}
                    </h2>
                  );
                }

                if (paragraph.startsWith('-')) {
                  // Handle lists
                  const items = paragraph
                    .split('\n')
                    .filter((line) => line.trim());
                  return (
                    <ul key={index} className="list-disc list-inside space-y-2">
                      {items.map((item, i) => (
                        <li key={i} className="ml-4">
                          {item.replace(/^-\s/, '')}
                        </li>
                      ))}
                    </ul>
                  );
                }

                if (paragraph.startsWith('1.')) {
                  // Handle ordered lists
                  const items = paragraph
                    .split('\n')
                    .filter((line) => line.trim());
                  return (
                    <ol
                      key={index}
                      className="list-decimal list-inside space-y-2"
                    >
                      {items.map((item, i) => (
                        <li key={i} className="ml-4">
                          {item.replace(/^\d+\.\s/, '')}
                        </li>
                      ))}
                    </ol>
                  );
                }

                if (paragraph.includes('```')) {
                  // Handle code blocks
                  const codeContent = paragraph.split('```')[1] || '';
                  return (
                    <pre
                      key={index}
                      className="bg-slate-100 dark:bg-slate-800 rounded p-4 overflow-x-auto border border-slate-300 dark:border-slate-700"
                    >
                      <code className="text-sm font-mono">{codeContent}</code>
                    </pre>
                  );
                }

                // Regular paragraph
                return (
                  <p key={index} className="text-slate-700 dark:text-slate-300">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          )}
        </div>
      </article>

      {/* Back to Articles */}
      <div className="pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          ← Back to Articles
        </Link>
      </div>
    </div>
  );
};

export default ArticlePage;
