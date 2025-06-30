# Client

Simple Astro app that renders a list of content articles from a specific Github repository those we fetch with our local server app. Each of the item in the page is a link. By clicking the link we redirect user to the page with markdown rendered in the browser.

**Tech Stack:** Astro, Tailwind, DaisyUI, Axios, HTMX

## Features Implemented

- 📚 **Article List**: Beautiful grid layout with article previews
- ⚡ **HTMX Integration**: Smooth article loading without page refreshes
- 🎨 **Modern UI**: Responsive design with DaisyUI components
- 🔍 **Syntax Highlighting**: Code blocks with highlight.js
- 🌙 **Theme Support**: Multiple themes (Light, Dark, Cupcake)
- 📱 **Mobile Responsive**: Works perfectly on all devices
- 🚀 **Fast Loading**: Optimized with caching and compression

## Deployment Architecture

The application is deployed using Docker Compose with the following services:

```
┌─────────────────────────────────────────┐
│                nginx                    │ ← Main entry point (port 80)
│         (Reverse Proxy)                 │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
        ▼                    ▼
┌─────────────┐    ┌─────────────────┐
│   client    │    │     server      │
│ (Static App)│    │   (API Layer)   │
└─────────────┘    └─────────┬───────┘
                              │
                              ▼
                      ┌─────────────┐
                      │  githuber   │
                      │(GitHub API) │
                      └─────────────┘
```

### Routing:
- **`/api/*`** → Server service (API endpoints)
- **`/*`** → Client service (Static Astro app)

## Markdown Rendering Strategy

**✅ Implemented: Hybrid Approach**
- Server processes basic markdown to HTML using markdown libraries
- Client handles advanced features (syntax highlighting, HTMX interactions)
- **Pros**: Balanced performance and flexibility, SEO-friendly
- **Result**: Fast initial loads with rich client-side interactions
