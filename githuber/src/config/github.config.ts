import { config } from 'dotenv';

config();

interface GitHubServiceConfig {
  token?: string;
  userAgent: string;
  baseUrl: string;
  rateLimit: number;
  timeout: number;
}

export const githubConfig: GitHubServiceConfig = {
  token: process.env.GITHUB_TOKEN,
  userAgent: process.env.GITHUB_USER_AGENT || 'GitHub-Service/1.0.0',
  baseUrl: process.env.GITHUB_BASE_URL || 'https://api.github.com',
  rateLimit: parseInt(process.env.GITHUB_RATE_LIMIT || '60', 10), // requests per minute
  timeout: parseInt(process.env.GITHUB_TIMEOUT || '30000', 10), // 30 seconds
};
