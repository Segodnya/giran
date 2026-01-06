import { processMarkdown } from './markdown.service';

const githuberBaseURL =
  process.env.GITHUBER_SERVICE_URL || 'http://localhost:3001';

export const getArticles = async () => {
  const response = await fetch(`${githuberBaseURL}/articles`);

  if (!response.ok) {
    throw new Error(`Failed to fetch articles: ${response.statusText}`);
  }

  return response.json();
};

export const getArticle = async (name: string) => {
  const response = await fetch(`${githuberBaseURL}/articles/${name}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch article: ${response.statusText}`);
  }

  const content = await response.text();
  const html = await processMarkdown(content);

  return {
    id: name.replace('.md', ''),
    name,
    content, // raw markdown
    html, // processed HTML
    size: content.length,
    type: 'file',
  };
};
