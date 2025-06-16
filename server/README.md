# Server

Node.js app to serve articles from a main branch of public Git repository.

TypeScript, Express.

Simple server app that uses our local Githuber service to provide API endpoints to get the list of content items and a specific item with a query as a plain markdown to be rendered with Astro app (we're using our own repository folder - https://github.com/Segodnya/giran/tree/main/content).

## Implementation Plan

### Phase 1: Express Server Setup
1. **Basic server configuration**
   - Create main Express app
   - Set up middleware (CORS, JSON parsing, logging)
   - Configure error handling middleware

2. **Route structure**
   - Create `/api/articles` route for listing articles
   - Create `/api/articles/:id` route for specific article
   - Add health check endpoint

### Phase 2: API Endpoints Implementation
1. **Articles listing endpoint**
   - Fetch all markdown files from repository
   - Parse metadata (title, date, tags)
   - Return formatted article list with pagination

2. **Single article endpoint**
   - Fetch specific markdown file by ID/path
   - Return raw markdown content
   - Add caching mechanism (once we request an article it should be cached)

### Phase 3: Testing and Documentation
1. **Testing setup**
   - Add unit tests for services
   - Create integration tests for API endpoints
   - Set up test coverage reporting

2. **API documentation**
   - Document API endpoints
   - Add example requests/responses
   - Create deployment instructions
