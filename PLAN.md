# Monolith Next.js App Rewrite Plan

## Project Overview

Transform from multi-service architecture (Astro client + Express server + GitHub service) into a unified Next.js monolith using Bun. The app reads and displays markdown articles with GitHub as the content source.

### Tech Stack

- **Framework**: Next.js 16 with App Router
- **Runtime**: Bun
- **UI**: Tailwind CSS + shadcn/ui
- **API**: Built-in API routes (no separate Express server)
- **Database**: GitHub repository (markdown files)
- **GitHub API**: Octokit with rate limiting and proper type safety

### Current Architecture

- `client/`: Astro SSR app with HTMX
- `server/`: Express/Elysia server with markdown processing
- `githuber/`: Dedicated GitHub API service layer
- `nginx`: Reverse proxy for routing

---

## Phase 1: Frontend Foundation with Mocks

### 1.1 Project Setup

- [x] Create Next.js project with Bun: `bun create next-app`
- [x] Update `package.json` with Bun scripts
- [x] Configure TypeScript with strict mode
- [x] Install dependencies: shadcn/ui, tailwind, markdown-it

### 1.2 UI Layout & Components

- [x] Create base layout wrapper component
- [x] Build article list page with mock data
  - Display article cards with title, preview, date
- [x] Build article detail page with mock data
  - Display formatted markdown as HTML
  - Add back navigation, breadcrumbs

### 1.3 Mock Data Layer

- [x] Create `lib/mocks/articles.ts` with sample article structure

  ```typescript
  interface Article {
    id: string;
    title: string;
    slug: string;
    content: string;      // markdown
    excerpt: string;
    createdAt: string;
    updatedAt: string;
  }

  // Mock data
  export const MOCK_ARTICLES: Article[] = [
    {
      id: 'astro',
      title: 'Astro Framework',
      slug: 'astro',
      content: '# Astro\n\nAstro is a modern...',
      excerpt: 'Build faster websites with Astro',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    // ... more mock articles
  ];
  ```

- [x] Mock 3-5 sample articles (use existing content from `/content` folder)
- [x] Create mock service function: `getMockArticles()`, `getMockArticle(id)`

### 1.4 Frontend Pages & Routes

- [x] Create `app/page.tsx` (articles list)
  - Fetch articles from mock service
  - Display in grid/list layout
  - Link to detail pages
- [x] Create `app/articles/[id]/page.tsx` (article detail)
  - Fetch single article from mock service
  - Render markdown with syntax highlighting
- [x] Test navigation between pages (no API calls yet)

### 1.5 Styling & Polish

- [x] Apply Tailwind theme (colors, spacing)
- [x] Ensure responsive design (mobile/tablet/desktop)
- [x] Add loading states and error boundaries

---

## Phase 2: Backend API with Mocked Articles

### 2.1 API Route Structure

- [x] Create `app/api/articles/route.ts` (GET list)
- [x] Create `app/api/articles/[id]/route.ts` (GET single)

### 2.2 Backend Services Layer

- [x] Create `lib/services/article.service.ts`
  - Implement `getArticles()` - returns mock list
  - Implement `getArticle(id: string)` - returns mock single
- [x] Create `lib/markdown.service.ts`
  - Convert markdown to HTML
  - Add syntax highlighting for code blocks
  - Extract frontmatter/metadata

### 2.3 API Integration in Frontend

- [x] Update `app/page.tsx` to fetch from `/api/articles`
  - Integrated TanStack Query `useQuery` for state management
  - Added loading, error, and empty states
- [x] Update `app/articles/[id]/page.tsx` to fetch from `/api/articles/[id]`
  - Integrated TanStack Query `useQuery` with dynamic route params
  - Renders HTML-formatted markdown content
  - Error handling with fallback to plain markdown rendering
- [x] Add error handling and loading states
- [x] Test API routes work correctly

### 2.4 Shared Types

- [x] Create `lib/types/github.ts` with comprehensive GitHub entity types
  - All type-safe with no implicit `any` types
  - `ErrorResponse` interface for GitHub API responses
  - All entity types: `GitHubConfig`, `GitHubRepository`, `GitHubContent`, `GitHubBranch`, `GitHubCommit`
  - `GitHubApiError` class with proper error handling

- [x] Create `lib/types/article.ts`
  - Export `Article`, `ArticleListItem` interfaces
  - Used in both frontend and backend
  - `app/providers.tsx` with TanStack Query configuration

### 2.5 Quality Improvements (Completed)

- [x] Fixed all TypeScript strict mode errors
- [x] Removed all explicit `any` types
- [x] Converted functions to arrow functions
- [x] Replaced useEffect with TanStack Query `useQuery` hooks
- [x] Added `@types/markdown-it` for full type coverage
- [x] All code passes ESLint and TypeScript compilation
- [x] Build succeeds with zero errors

---

## Phase 3: GitHub Integration

### 3.1 GitHub Service Layer - Type-Safe Implementation

- [x] Create `lib/services/github.service.ts` with Octokit integration
  - **Core class**: `GitHubService` with rate limiting and error handling
  - **Dependencies**: `@octokit/rest`, `p-limit`
  - **Rate limiting**: 60 requests per minute (configurable)
  - **Base code to migrate** (from `githuber/github.service.ts`):

```typescript
import { Octokit } from '@octokit/rest';
import pLimit from 'p-limit';
import { GitHubConfig, GitHubRepository, GitHubContent, GitHubApiError } from '../types/github';

export class GitHubService {
  private octokit: Octokit;
  private rateLimiter: ReturnType<typeof pLimit>;
  private requestCount = 0;
  private lastResetTime = Date.now();

  constructor(config: GitHubConfig = {}) {
    const token = config.token || process.env.GITHUB_TOKEN;

    if (!token) {
      console.warn('GitHub token not provided. API requests will be limited.');
    }

    this.octokit = new Octokit({
      auth: token,
      userAgent: config.userAgent || 'GitHub-Service/1.0.0',
      baseUrl: config.baseUrl || 'https://api.github.com',
    });

    // Rate limiter (GitHub allows 5000 requests per hour for authenticated users)
    const rateLimit = config.rateLimit || 60; // requests per minute
    this.rateLimiter = pLimit(rateLimit);
  }

  /**
   * Get repository information
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    return this.rateLimiter(async () => {
      try {
        this.trackRequest();
        const { data } = await this.octokit.rest.repos.get({ owner, repo });

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
        };
      } catch (error) {
        throw this.handleError(error);
      }
    });
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
        this.trackRequest();
        const { data } = await this.octokit.rest.repos.getContent({
          owner,
          repo,
          path,
          ref,
        });

        const contents = Array.isArray(data) ? data : [data];

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
        }));
      } catch (error) {
        throw this.handleError(error);
      }
    });
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
    const contents = await this.getContent(owner, repo, path, ref);
    const file = contents[0];

    if (!file || file.type !== 'file' || !file.content) {
      throw new GitHubApiError(`Path ${path} is not a file or content is not available`);
    }

    if (file.encoding === 'base64') {
      return Buffer.from(file.content, 'base64').toString('utf-8');
    }

    return file.content;
  }

  /**
   * Normalize and validate error responses
   */
  private handleError(error: any): GitHubApiError {
    if (error instanceof GitHubApiError) {
      return error;
    }

    const message = error?.message || 'Unknown GitHub API error';
    const status = error?.status;

    return new GitHubApiError(message, status, error);
  }

  /**
   * Track request count for rate limit monitoring
   */
  private trackRequest(): void {
    const now = Date.now();
    const timeSinceReset = now - this.lastResetTime;

    // Reset counter every minute
    if (timeSinceReset > 60000) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    this.requestCount++;
  }
}
```

- [x] Implement article-specific methods:
  - `listArticles(owner, repo, folder)` - list markdown files in folder
  - `getArticle(owner, repo, filePath)` - fetch single article with content
  - Handle both file and directory responses
  - Decode base64 content automatically

### 3.2 Environment Configuration

- [x] Add to `.env.local`:

  ```bash
  GITHUB_TOKEN=xxx
  GITHUB_REPO_OWNER=xxx
  GITHUB_REPO_NAME=xxx
  GITHUB_REPO_FOLDER=content
  ```

- [x] Create `lib/config.ts` to validate and expose env vars

  ```typescript
  export const GITHUB_CONFIG = {
    token: process.env.GITHUB_TOKEN,
    owner: process.env.GITHUB_REPO_OWNER,
    repo: process.env.GITHUB_REPO_NAME,
    folder: process.env.GITHUB_REPO_FOLDER || 'content',
  };

  export function isGitHubEnabled(): boolean {
    return !!(GITHUB_CONFIG.token && GITHUB_CONFIG.owner && GITHUB_CONFIG.repo);
  }
  ```

### 3.3 Replace Mock with GitHub Data

- [x] Update `lib/services/article.service.ts`
  - Keep mock as fallback
  - Use GitHub service when enabled
  - Implement smart caching:
    - Cache articles in-memory with TTL (time-to-live)
    - Track last commit SHA to invalidate cache when content changes
    - Reduce API calls by caching list responses

```typescript
export const getArticles = async () => {
  if (isGitHubEnabled()) {
    return getArticlesFromGitHub();
  }

  return getMockArticles();
};

export const getArticle = async (id: string) => {
  if (isGitHubEnabled()) {
    return getArticleFromGitHub(id);
  }

  return getMockArticle(id);
};
```

### 3.4 Testing

- [ ] Test article list loads from GitHub
- [ ] Test article detail loads from GitHub with correct markdown content
- [ ] Test error handling when GitHub is unavailable (fallback to mocks)
- [ ] Test rate limiting doesn't block requests
- [ ] Test cache invalidation on new commits
- [ ] Verify all types are preserved (no `any` types)

---

## Phase 4: Docker & Deployment

### 4.1 Dockerfile Consolidation

- [ ] Create single `Dockerfile` for Next.js monolith
  - Multi-stage build: build Next.js, then run with Bun
  - Expose port 3000

### 4.2 docker-compose Update

- [ ] Replace multi-service setup with single Next.js container
- [ ] Remove `githuber`, `server` services completely
- [ ] Keep `nginx` for reverse proxy (optional, can be removed if not needed)
- [ ] Configure HMR for local development with volume mounts

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      GITHUB_TOKEN: ${GITHUB_TOKEN}
      GITHUB_REPO_OWNER: ${GITHUB_REPO_OWNER}
      GITHUB_REPO_NAME: ${GITHUB_REPO_NAME}
      GITHUB_REPO_FOLDER: ${GITHUB_REPO_FOLDER:-content}
    volumes:
      - ./src:/app/src
      - ./lib:/app/lib
```

### 4.3 Build & Run

- [ ] Create unified `Dockerfile` (multi-stage)
  - Stage 1: Build with Bun
  - Stage 2: Run Next.js with Bun runtime
- [ ] Update `Makefile` for single-app deployment
- [ ] Test with `docker-compose up`

---

## Phase 5: Cleanup & Optimization

### 5.1 Code Cleanup

- [ ] **Delete completely**:
  - `client/` - Astro app (replaced by Next.js)
  - `server/` - Express/Elysia server (functionality moved to Next.js API routes)
  - `githuber/` - GitHub API wrapper (GitHub logic now in lib/services)
  - `admin-front/` - Unused frontend
  - `nginx.conf` - No longer needed with single container
- [ ] **Keep as reference**:
  - `/content` folder - sample articles (can be reference for types/structure)
- [ ] Update `.gitignore` to exclude old directories if keeping for reference

### 5.2 Performance

- [ ] Add ISR (Incremental Static Regeneration) for article pages
  - Revalidate on-demand when articles are updated
  - Cache static HTML for frequently accessed articles
- [ ] Implement smart caching for GitHub API
  - In-memory cache with TTL
  - Invalidate on repository commits
  - Monitor rate limits
- [ ] Optimize markdown parsing
  - Lazy load highlight.js only when needed
  - Consider markdown-it plugins for performance

### 5.3 Documentation

- [ ] Update `README.md` with new architecture

  ```markdown
  # Giran - Article Reader Fullstack-App

  Single Next.js 16 app powered by Bun.

  ## Setup
  - GitHub token for fetching articles
  - Environment variables for GitHub repository

  ## Local Development
  - `bun install`
  - `bun run dev`

  ## Docker
  - `docker-compose up`
  ```

- [ ] Document all environment variables
- [ ] Add local development instructions
- [ ] Document GitHub rate limiting and caching strategy

---

## Success Criteria

- ✅ Single Next.js app serves all functionality
- ✅ Frontend renders with mock data
- ✅ Backend API routes work
- ✅ GitHub integration fetches real articles
- ✅ Docker builds and runs single container
- ✅ HMR works in local development
- ✅ No external services needed (githuber, separate server)
