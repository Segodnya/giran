import { processMarkdown } from './markdown.service';

const githuberBaseURL =
  process.env.GITHUBER_SERVICE_URL || 'http://localhost:3001';

export const getArticles = async () => {
  const response = await fetch(`${githuberBaseURL}/articles`);

  if (!response.ok) {
    throw new Error(`Failed to fetch articles: ${response.statusText}`);
  }

  const items = (await response.json()) as any[];

  // Normalize response into the shape expected by the client
  // { id, name, size, type }
  return items.map((item: any) => ({
    id: typeof item.name === 'string' ? item.name.replace('.md', '') : '',
    name: item.name,
    size: item.size,
    type: item.type,
  }));
};

export const getArticle = async (name: string) => {
  const fileName = name.endsWith('.md') ? name : `${name}.md`;
  const response = await fetch(`${githuberBaseURL}/articles/${fileName}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch article: ${response.statusText}`);
  }

  const content = await response.text();
  const html = await processMarkdown(content);

  return {
    id: fileName.replace('.md', ''),
    name: fileName,
    content, // raw markdown
    html, // processed HTML
    size: content.length,
    type: 'file',
  };
};
