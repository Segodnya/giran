export interface GitHubConfig {
  token?: string;
  userAgent?: string;
  baseUrl?: string;
  rateLimit?: number;
}

export interface GitHubRepository {
  owner: string;
  repo: string;
  fullName: string;
  description: string | null;
  private: boolean;
  fork: boolean;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  size: number;
  stargazersCount: number;
  watchersCount: number;
  language: string | null;
  forksCount: number;
  defaultBranch: string;
}

export interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  htmlUrl: string;
  downloadUrl: string | null;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface GitHubCommit {
  sha: string;
  url: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  committer: {
    name: string;
    email: string;
    date: string;
  };
  message: string;
}

interface ErrorResponse {
  message?: string;
  documentation_url?: string;
  [key: string]: unknown;
}

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: ErrorResponse,
  ) {
    super(message);
    this.name = 'GitHubApiError';
  }
}
