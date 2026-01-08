import { z } from 'zod';

// Zod Schemas
export const GitHubConfigSchema = z.object({
  token: z.string().optional(),
  userAgent: z.string().optional(),
  baseUrl: z.string().optional(),
  rateLimit: z.number().optional(),
});

export const GitHubRepositorySchema = z.object({
  owner: z.string(),
  repo: z.string(),
  fullName: z.string(),
  description: z.string().nullable(),
  private: z.boolean(),
  fork: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  pushedAt: z.string(),
  size: z.number(),
  stargazersCount: z.number(),
  watchersCount: z.number(),
  language: z.string().nullable(),
  forksCount: z.number(),
  defaultBranch: z.string(),
});

export const GitHubContentSchema = z
  .object({
    name: z.string(),
    path: z.string(),
    sha: z.string(),
    size: z.number(),
    url: z.string(),
    html_url: z.string(),
    download_url: z.string().nullable(),
    type: z.enum(['file', 'dir']),
    content: z.string().optional(),
    encoding: z.string().optional(),
  })
  .transform((data) => ({
    name: data.name,
    path: data.path,
    sha: data.sha,
    size: data.size,
    url: data.url,
    htmlUrl: data.html_url,
    downloadUrl: data.download_url,
    type: data.type,
    content: data.content,
    encoding: data.encoding,
  }));

export const GitHubBranchSchema = z.object({
  name: z.string(),
  commit: z.object({
    sha: z.string(),
    url: z.string(),
  }),
  protected: z.boolean(),
});

export const GitHubCommitSchema = z.object({
  sha: z.string(),
  url: z.string(),
  author: z.object({
    name: z.string(),
    email: z.string(),
    date: z.string(),
  }),
  committer: z.object({
    name: z.string(),
    email: z.string(),
    date: z.string(),
  }),
  message: z.string(),
});

export const ErrorResponseSchema = z
  .object({
    message: z.string().optional(),
    documentation_url: z.string().optional(),
  })
  .passthrough();

export type GitHubConfig = z.infer<typeof GitHubConfigSchema>;
export type GitHubRepository = z.infer<typeof GitHubRepositorySchema>;
export type GitHubContent = z.infer<typeof GitHubContentSchema>;
export type GitHubBranch = z.infer<typeof GitHubBranchSchema>;
export type GitHubCommit = z.infer<typeof GitHubCommitSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

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
