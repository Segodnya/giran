# Giran - Next.js Monolith Blog

A modern, type-safe blog platform built with Next.js 16 and Bun, featuring GitHub as a content management system.

## Architecture Overview

### Tech Stack

- **Framework**: Next.js 16 with App Router
- **Runtime**: Bun
- **UI**: Tailwind CSS + shadcn/ui
- **API**: Built-in Next.js API routes
- **Content Source**: GitHub repository (markdown files)
- **GitHub API**: Octokit with rate limiting and intelligent caching
- **State Management**: TanStack Query for server state
- **Testing**: Bun test runner with comprehensive coverage

### Key Features

- 📝 **Markdown-based content** - Write articles in markdown, stored in GitHub
- ⚡ **ISR (Incremental Static Regeneration)** - Fast page loads with on-demand revalidation
- 🔒 **Type-safe** - Full TypeScript strict mode with zero `any` types
- 🎨 **Syntax highlighting** - Code blocks with highlight.js
- 📊 **Smart caching** - In-memory cache with TTL and commit-based invalidation
- 🚦 **Rate limiting** - GitHub API rate limiter to avoid hitting limits
- 🔄 **Mock fallback** - Seamless fallback to mock data when GitHub is unavailable
- 🐳 **Docker-ready** - Multi-stage Dockerfile with hot module reloading support

### Project Structure

```text
giran/
├── app/                         # Next.js app router
│   ├── api/                     # API routes
│   │   └── articles/            # Articles endpoints
│   ├── articles/[id]/           # Dynamic article detail pages
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page (article list)
│   └── providers.tsx            # TanStack Query provider
├── lib/                         # Core business logic
│   ├── config.ts                # Environment configuration
│   ├── mocks/                   # Mock data for fallback
│   ├── services/                # Service layer
│   │   ├── article.service.ts   # Article aggregation (GitHub + mock)
│   │   ├── github.service.ts    # GitHub API wrapper
│   │   └── markdown.service.ts  # Markdown processing
│   └── types/                   # TypeScript type definitions
├── content/                     # Sample markdown articles (reference)
├── public/                      # Static assets
├── Dockerfile                   # Multi-stage Docker build
├── docker-compose.yml           # Local development setup
└── Makefile                     # Build/deploy automation
```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required for GitHub Integration

```bash
# GitHub Personal Access Token (optional - falls back to mocks if not provided)
# Create at: https://github.com/settings/tokens
# Required scopes: repo (for private repos) or public_repo (for public repos only)
GITHUB_TOKEN=ghp_your_token_here

# GitHub repository information
GITHUB_REPO_OWNER=your-username
GITHUB_REPO_NAME=your-repo-name

# Folder containing markdown articles (defaults to 'content' if not specified)
GITHUB_REPO_FOLDER=content
```

### Optional Configuration

```bash
# Node environment (development, production, test)
NODE_ENV=development

# GitHub API base URL (defaults to https://api.github.com)
GITHUB_API_BASE_URL=https://api.github.com

# Rate limit for GitHub API requests (requests per minute, defaults to 60)
GITHUB_RATE_LIMIT=60
```

> **Note**: If GitHub environment variables are not configured, the app automatically falls back to mock data for local development.

## Local Development

### Prerequisites

- [Bun](https://bun.sh/) v1.0.0 or higher
- Node.js v18+ (for compatibility with some tools)
- Git
- (Optional) Docker and Docker Compose

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/segodnya/giran.git
   cd giran
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your GitHub credentials (or skip for mock mode)
   ```

4. **Run the development server**

   ```bash
   bun dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the app.

### Available Scripts

```bash
# Development
bun dev              # Start dev server with hot reload

# Production
bun build            # Build optimized production bundle
bun start            # Run production server

# Testing
bun test             # Run all tests
bun test:watch       # Run tests in watch mode
bun test:coverage    # Generate test coverage report

# Code Quality
bun lint             # Run ESLint
bun lint:fix         # Fix ESLint errors automatically
bun type-check       # Run TypeScript compiler checks
bun knip             # Find unused files, dependencies, and exports

# Docker
make build           # Build Docker image
make up              # Start Docker Compose services
make down            # Stop Docker Compose services
make logs            # View Docker logs
```

### Docker Development

For a containerized development environment with hot module reloading:

1. **Configure environment**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

2. **Start Docker services**

   ```bash
   docker-compose up
   ```

3. **Access the app**

   Open [http://localhost:3000](http://localhost:3000)

The Docker setup includes:

- Volume mounts for hot reloading (`app/`, `lib/` directories)
- Environment variable injection
- Automatic restart on file changes

## GitHub Rate Limiting & Caching Strategy

### Rate Limiting

GitHub API has the following rate limits:

- **Authenticated requests**: 5,000 requests per hour
- **Unauthenticated requests**: 60 requests per hour

Our implementation includes a built-in rate limiter:

```typescript
// lib/services/github.service.ts
const rateLimit = 60; // requests per minute (configurable)
```

**How it works:**

- Uses `p-limit` to queue concurrent requests
- Tracks request count and resets every minute
- Prevents hitting GitHub's rate limits
- Logs warnings when approaching limits

### Caching Strategy

To minimize API calls and improve performance, we implement a multi-layer caching approach:

#### 1. **In-Memory Cache with TTL**

```typescript
// Cached for 5 minutes (configurable)
const CACHE_TTL = 5 * 60 * 1000;
```

- Articles list cached for 5 minutes
- Individual articles cached for 5 minutes
- Automatic cache expiration based on TTL

#### 2. **Commit-Based Invalidation**

- Tracks the last commit SHA of the content folder
- Invalidates cache when new commits are detected
- Ensures content is always up-to-date without over-fetching

#### 3. **ISR (Incremental Static Regeneration)**

```typescript
// app/articles/[id]/page.tsx
export const revalidate = 300; // 5 minutes
```

- Static pages regenerated every 5 minutes
- On-demand revalidation with webhooks (future enhancement)
- Serves cached HTML for instant page loads

### Cache Behavior

| Scenario | Behavior |
| -------- | -------- |
| First request | Fetches from GitHub API, caches result |
| Subsequent requests (within TTL) | Serves from memory cache (instant) |
| Cache expired | Re-fetches from GitHub, updates cache |
| New commit detected | Invalidates cache, fetches fresh data |
| GitHub unavailable | Falls back to last cached data or mocks |

### Monitoring & Debugging

Enable cache debugging in development:

```typescript
// Set in lib/services/article.service.ts
const DEBUG_CACHE = true;
```

This logs:

- Cache hits/misses
- API call count
- Rate limit status
- Commit SHA changes

### Best Practices

1. **Use environment variables** to configure rate limits for different environments
2. **Monitor GitHub API usage** at <https://github.com/settings/tokens>
3. **Implement webhooks** for instant cache invalidation on content updates (future enhancement)
4. **Use mock data** during development to avoid burning API quota

## Testing

The project includes comprehensive test coverage:

```bash
bun test                    # Run all tests
bun test lib/services       # Test specific directory
bun test:coverage           # Generate coverage report
```

### Test Coverage

- ✅ **GitHub Service** - API integration, rate limiting, error handling
- ✅ **Article Service** - Caching, mock fallback, data transformation
- ✅ **Markdown Service** - Parsing, syntax highlighting, frontmatter
- ✅ **API Routes** - HTTP endpoints, response validation

## Deployment

### Docker Production Build

```bash
# Build production image
docker build -t giran:latest .

# Run container
docker run -p 3000:3000 \
  -e GITHUB_TOKEN=your_token \
  -e GITHUB_REPO_OWNER=owner \
  -e GITHUB_REPO_NAME=repo \
  giran:latest
```

### Deploy to Vercel

```bash
# Install Vercel CLI
bun add -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# https://vercel.com/your-project/settings/environment-variables
```

### Deploy to Other Platforms

The app is compatible with any platform that supports:

- Bun runtime (or Node.js with minor adjustments)
- Environment variables
- Port 3000 (configurable)

## Contributing

Contributions are welcome! Please ensure:

1. All tests pass: `bun test`
2. No TypeScript errors: `bun type-check`
3. Code is linted: `bun lint:fix`
4. No unused code: `bun knip`

## License

MIT

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Bun Documentation](https://bun.sh/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [GitHub REST API](https://docs.github.com/en/rest)
