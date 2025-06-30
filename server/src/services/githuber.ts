import axios from 'axios';

import { processMarkdown } from './markdown';

const githuberClient = axios.create({
  baseURL: process.env.GITHUBEER_SERVICE_URL || 'http://localhost:3001',
});

export const getArticles = async () => {
  const response = await githuberClient.get('/articles');

  return response.data;
};

export const getArticle = async (name: string) => {
  const { data: content } = await githuberClient.get(`/articles/${name}`);

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
