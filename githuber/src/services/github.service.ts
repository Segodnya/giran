import { Octokit } from '@octokit/rest'
import pLimit from 'p-limit'
import { config } from 'dotenv'

config()

export interface GitHubConfig {
  token?: string
  userAgent?: string
  baseUrl?: string
  rateLimit?: number
}

export interface GitHubRepository {
  owner: string
  repo: string
  fullName: string
  description: string | null
  private: boolean
  fork: boolean
  createdAt: string
  updatedAt: string
  pushedAt: string
  size: number
  stargazersCount: number
  watchersCount: number
  language: string | null
  forksCount: number
  defaultBranch: string
}

export interface GitHubContent {
  name: string
  path: string
  sha: string
  size: number
  url: string
  htmlUrl: string
  downloadUrl: string | null
  type: 'file' | 'dir'
  content?: string
  encoding?: string
}

export interface GitHubBranch {
  name: string
  commit: {
    sha: string
    url: string
  }
  protected: boolean
}

export interface GitHubCommit {
  sha: string
  url: string
  author: {
    name: string
    email: string
    date: string
  }
  committer: {
    name: string
    email: string
    date: string
  }
  message: string
}

export class GitHubApiError extends Error {
  constructor(message: string, public status?: number, public response?: any) {
    super(message)
    this.name = 'GitHubApiError'
  }
}

export class GitHubService {
  private octokit: Octokit
  private rateLimiter: ReturnType<typeof pLimit>
  private requestCount = 0
  private lastResetTime = Date.now()

  constructor(config: GitHubConfig = {}) {
    const token = config.token || process.env.GITHUB_TOKEN

    if (!token) {
      console.warn('GitHub token not provided. API requests will be limited.')
    }

    this.octokit = new Octokit({
      auth: token,
      userAgent: config.userAgent || 'GitHub-Service/1.0.0',
      baseUrl: config.baseUrl || 'https://api.github.com',
    })

    // Rate limiter (GitHub allows 5000 requests per hour for authenticated users)
    const rateLimit = config.rateLimit || 60 // requests per minute
    this.rateLimiter = pLimit(rateLimit)
  }

  /**
   * Get current rate limit status
   */
  async getRateLimit(): Promise<any> {
    try {
      const response = await this.octokit.rest.rateLimit.get()
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get repository information
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    return this.rateLimiter(async () => {
      try {
        this.trackRequest()
        const response = await this.octokit.rest.repos.get({
          owner,
          repo,
        })

        const data = response.data
        return {
          owner: data.owner.login,
          repo: data.name,
          fullName: data.full_name,
          description: data.description,
          private: data.private,
          fork: data.fork,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          pushedAt: data.pushed_at,
          size: data.size,
          stargazersCount: data.stargazers_count,
          watchersCount: data.watchers_count,
          language: data.language,
          forksCount: data.forks_count,
          defaultBranch: data.default_branch,
        }
      } catch (error) {
        throw this.handleError(error)
      }
    })
  }

  /**
   * Get repository content (file or directory)
   */
  async getContent(
    owner: string,
    repo: string,
    path: string = '',
    ref?: string,
  ): Promise<GitHubContent[]> {
    return this.rateLimiter(async () => {
      try {
        this.trackRequest()
        const response = await this.octokit.rest.repos.getContent({
          owner,
          repo,
          path,
          ref,
        })

        const data = response.data
        const contents = Array.isArray(data) ? data : [data]

        return contents.map((item: any) => ({
          name: item.name,
          path: item.path,
          sha: item.sha,
          size: item.size,
          url: item.url,
          htmlUrl: item.html_url,
          downloadUrl: item.download_url,
          type: item.type as 'file' | 'dir',
          content: item.content,
          encoding: item.encoding,
        }))
      } catch (error) {
        throw this.handleError(error)
      }
    })
  }

  /**
   * Get file content as string (decoded from base64)
   */
  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    ref?: string,
  ): Promise<string> {
    const contents = await this.getContent(owner, repo, path, ref)
    const file = contents[0]

    if (!file || file.type !== 'file' || !file.content) {
      throw new GitHubApiError(
        `Path ${path} is not a file or content is not available`,
      )
    }

    if (file.encoding === 'base64') {
      return Buffer.from(file.content, 'base64').toString('utf-8')
    }

    return file.content
  }

  /**
   * Get repository branches
   */
  async getBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
    return this.rateLimiter(async () => {
      try {
        this.trackRequest()
        const response = await this.octokit.rest.repos.listBranches({
          owner,
          repo,
        })

        return response.data.map((branch: any) => ({
          name: branch.name,
          commit: {
            sha: branch.commit.sha,
            url: branch.commit.url,
          },
          protected: branch.protected,
        }))
      } catch (error) {
        throw this.handleError(error)
      }
    })
  }

  /**
   * Get commits for a repository
   */
  async getCommits(
    owner: string,
    repo: string,
    options: {
      sha?: string
      path?: string
      author?: string
      since?: string
      until?: string
      perPage?: number
      page?: number
    } = {},
  ): Promise<GitHubCommit[]> {
    return this.rateLimiter(async () => {
      try {
        this.trackRequest()
        const response = await this.octokit.rest.repos.listCommits({
          owner,
          repo,
          sha: options.sha,
          path: options.path,
          author: options.author,
          since: options.since,
          until: options.until,
          per_page: options.perPage || 30,
          page: options.page || 1,
        })

        return response.data.map((commit: any) => ({
          sha: commit.sha,
          url: commit.url,
          author: {
            name: commit.commit.author.name,
            email: commit.commit.author.email,
            date: commit.commit.author.date,
          },
          committer: {
            name: commit.commit.committer.name,
            email: commit.commit.committer.email,
            date: commit.commit.committer.date,
          },
          message: commit.commit.message,
        }))
      } catch (error) {
        throw this.handleError(error)
      }
    })
  }

  /**
   * Search repositories
   */
  async searchRepositories(
    query: string,
    options: {
      sort?: 'stars' | 'forks' | 'help-wanted-issues' | 'updated'
      order?: 'asc' | 'desc'
      perPage?: number
      page?: number
    } = {},
  ): Promise<{ repositories: GitHubRepository[]; totalCount: number }> {
    return this.rateLimiter(async () => {
      try {
        this.trackRequest()
        const response = await this.octokit.rest.search.repos({
          q: query,
          sort: options.sort,
          order: options.order,
          per_page: options.perPage || 30,
          page: options.page || 1,
        })

        const repositories = response.data.items.map((repo: any) => ({
          owner: repo.owner.login,
          repo: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          private: repo.private,
          fork: repo.fork,
          createdAt: repo.created_at,
          updatedAt: repo.updated_at,
          pushedAt: repo.pushed_at,
          size: repo.size,
          stargazersCount: repo.stargazers_count,
          watchersCount: repo.watchers_count,
          language: repo.language,
          forksCount: repo.forks_count,
          defaultBranch: repo.default_branch,
        }))

        return {
          repositories,
          totalCount: response.data.total_count,
        }
      } catch (error) {
        throw this.handleError(error)
      }
    })
  }

  /**
   * Check if a repository is public
   */
  async isRepositoryPublic(owner: string, repo: string): Promise<boolean> {
    try {
      const repository = await this.getRepository(owner, repo)
      return !repository.private
    } catch (error) {
      if (error instanceof GitHubApiError && error.status === 404) {
        return false // Repository doesn't exist or is private
      }
      throw error
    }
  }

  /**
   * Get repository tree (recursive directory structure)
   */
  async getTree(
    owner: string,
    repo: string,
    sha: string = 'HEAD',
    recursive: boolean = false,
  ): Promise<any> {
    return this.rateLimiter(async () => {
      try {
        this.trackRequest()
        const response = await this.octokit.rest.git.getTree({
          owner,
          repo,
          tree_sha: sha,
          recursive: recursive ? '1' : undefined,
        })

        return response.data
      } catch (error) {
        throw this.handleError(error)
      }
    })
  }

  /**
   * Track request count for monitoring
   */
  private trackRequest(): void {
    this.requestCount++

    // Reset counter every hour
    const now = Date.now()
    if (now - this.lastResetTime > 3600000) {
      // 1 hour
      this.requestCount = 0
      this.lastResetTime = now
    }
  }

  /**
   * Get current request statistics
   */
  getRequestStats(): { count: number; resetTime: Date } {
    return {
      count: this.requestCount,
      resetTime: new Date(this.lastResetTime + 3600000),
    }
  }

  /**
   * Handle API errors with proper error mapping
   */
  private handleError(error: any): GitHubApiError {
    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || error.message

      switch (status) {
        case 401:
          return new GitHubApiError(
            'Authentication failed. Check your GitHub token.',
            status,
            error.response,
          )
        case 403:
          if (error.response.data?.message?.includes('rate limit')) {
            return new GitHubApiError(
              'Rate limit exceeded. Please try again later.',
              status,
              error.response,
            )
          }
          return new GitHubApiError(
            'Access forbidden. Check your permissions.',
            status,
            error.response,
          )
        case 404:
          return new GitHubApiError(
            'Repository or resource not found.',
            status,
            error.response,
          )
        case 422:
          return new GitHubApiError(
            'Validation failed. Check your request parameters.',
            status,
            error.response,
          )
        default:
          return new GitHubApiError(
            `GitHub API error: ${message}`,
            status,
            error.response,
          )
      }
    }

    return new GitHubApiError(`Network or unknown error: ${error.message}`)
  }
}

export const githubService = new GitHubService()
