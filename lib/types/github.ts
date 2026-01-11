import { z } from 'zod';

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

export const ErrorResponseSchema = z
  .object({
    message: z.string().optional(),
    documentation_url: z.string().optional(),
  })
  .passthrough();
export type GitHubConfig = {
  token?: string;
  userAgent?: string;
  baseUrl?: string;
  rateLimit?: number;
};

export type GitHubRepository = {
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
};

export type GitHubContent = z.infer<typeof GitHubContentSchema>;
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
