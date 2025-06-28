import { config } from 'dotenv'

config()

export interface GitHubServiceConfig {
  token?: string
  userAgent: string
  baseUrl: string
  rateLimit: number
  timeout: number
}

export const githubConfig: GitHubServiceConfig = {
  token: process.env.GITHUB_TOKEN,
  userAgent: process.env.GITHUB_USER_AGENT || 'GitHub-Service/1.0.0',
  baseUrl: process.env.GITHUB_BASE_URL || 'https://api.github.com',
  rateLimit: parseInt(process.env.GITHUB_RATE_LIMIT || '60', 10), // requests per minute
  timeout: parseInt(process.env.GITHUB_TIMEOUT || '30000', 10), // 30 seconds
}

export const validateGitHubConfig = (): void => {
  if (!githubConfig.token) {
    console.warn(
      '⚠️  GITHUB_TOKEN environment variable is not set. API requests will be limited to unauthenticated rate limits.',
    )
  }

  if (githubConfig.rateLimit < 1 || githubConfig.rateLimit > 100) {
    console.warn(
      '⚠️  GITHUB_RATE_LIMIT should be between 1 and 100 requests per minute. Using default value of 60.',
    )
    githubConfig.rateLimit = 60
  }

  console.log('✅ GitHub API configuration loaded successfully')
}
