# Client

Simple Astro app that renders a list of content articles from a specific Github repository those we fetch with our local server app. Each of the item in the page is a link. By clicking the link we redirect user to the page with markdown rendered in the browser.

Astro, Tailwind, DaisyUI, Axios, Htmx

## Current Project Status

✅ **Server**: Implemented with `/api/articles` and `/api/articles/:id` endpoints  
✅ **Githuber Service**: Implemented and fetches raw markdown from GitHub repositories  
❌ **Client**: Not yet implemented (this plan)  
✅ **Content Examples**: Available in `/content` directory

## Implementation Plan

### Phase 1: Project Setup & Core Structure

1.  **Initialize Astro Project**: Set up a new Astro project within the `client` directory using the "Empty" template.
2.  **Install Dependencies**: Install required packages:
    - `htmx.org` - For dynamic content loading
    - `tailwindcss` & `@astrojs/tailwind` - For styling
    - `daisyui` - For UI components  
    - `axios` - For API calls
    - `@astrojs/markdoc` - For markdown to HTML conversion
3.  **Configure Tailwind**: Set up the `tailwind.config.mjs` file, integrate it with Astro, and add the `daisyui` plugin.
4.  **Create API Service**: Implement a service to fetch the list of articles from the `server`'s `/api/articles` endpoint. This will be used by our Astro pages on the server side.
5.  **Create Main Layout**: Develop a main layout component. This will include the base HTML structure, stylesheets, and the `htmx.org` script.

### Phase 2: Article List & Markdown Rendering

6.  **Create Article List Page**: Build the main `index.astro` page. It will fetch all articles and display them as a list. Each link will use `htmx` attributes (`hx-get`, `hx-target`) to dynamically load the article content into a designated area on the page.
7.  **Implement Markdown Processing**: Set up markdown to HTML conversion using one of these approaches:
    - **Server-side processing**: Modify the server to convert markdown to HTML before sending to client
    - **Astro native**: Use `@astrojs/markdoc` integration for advanced markdown processing
8.  **Add Styling**: Use `tailwindcss` and `daisyui` to create a clean and modern UI for the article list.

### Phase 3: Dynamic Content with HTMX

9.  **Create Dynamic Article Endpoint**: Implement a dynamic Astro route at `src/pages/articles/[slug].astro`. This page will be responsible for fetching and rendering a single article's content.
10. **Implement Partial Loading**: The article endpoint will be designed to return either a full HTML page (for direct navigation) or just the article content as an HTML fragment (for requests made by `htmx`). We can use a request header check to differentiate.
11. **Render Markdown Content**: The article's markdown content, fetched from the server's `/api/articles/:id` endpoint, will be converted to HTML and displayed. When loaded via `htmx`, this will seamlessly appear on the main page without a page refresh.
12. **Handle Code Syntax Highlighting**: Add syntax highlighting for code blocks in markdown using `highlight.js`.
13. **Enhance Styling**: Apply `tailwindcss` and `daisyui` styles to the article content for a consistent and polished look, including proper typography for headings, paragraphs, code blocks, and lists.

### Phase 4: Deployment

14. **Create a Dockerfile**: Create a `Dockerfile` in the `client` directory for a production-ready build. This will use a multi-stage build: a `node` stage to build the static assets, and a lightweight `nginx` stage to serve them.
15. **Add Nginx Configuration**: Add a simple `nginx.conf` file to configure serving the static files and proxying API requests to the `server` service to avoid CORS issues.
16. **Update Docker Compose**: Modify the main `docker-compose.yml` at the project root to include the new `client` service. This service will be built from its Dockerfile and exposed to the host machine.

## Markdown Rendering Strategy

Given that the server currently returns raw markdown content, we have this option:

### Option: Hybrid Approach
- Server processes basic markdown to HTML
- Client handles advanced features (syntax highlighting, custom components)
- Pros: Balanced performance and flexibility
- Cons: More complex implementation
