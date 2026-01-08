import { getMockArticle } from '@/lib/mocks/articles';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface ArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

const ArticlePage = async (props: ArticlePageProps) => {
  const { params } = props;
  const { id } = await params;
  const article = getMockArticle(id);

  if (!article) {
    notFound();
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
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
          {/* Render markdown as formatted text */}
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
