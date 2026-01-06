# Server

Bun app to serve articles from a main branch of public Git repository.

TypeScript, Bun, Elysia, Markdown-it.

Simple server app that uses our local Githuber service to provide API endpoints to get the list of content items and a specific item. The server processes markdown content into HTML before returning it to the client (we're using our own repository folder - <https://github.com/Segodnya/giran/tree/main/content>).

## API

### Get all articles

- **Endpoint:** `/api/articles`
- **Method:** `GET`
- **Description:** Retrieves a list of all articles.
- **Success Response:**
  - **Code:** 200
  - **Content:**

    ```json
    [
        {
            "id": "an-article",
            "title": "An Article"
        }
    ]
    ```

### Get a single article

- **Endpoint:** `/api/articles/:id`
- **Method:** `GET`
- **Description:** Retrieves a single article by its ID with both raw markdown content and processed HTML.
- **URL Params:**
  - **Required:** `id=[string]`
- **Success Response:**
  - **Code:** 200
  - **Content:**

    ```json
    {
        "id": "an-article",
        "name": "an-article.md",
        "content": "# Article Title\n\nThis is the raw markdown content.",
        "html": "<h1>Article Title</h1>\n<p>This is the processed HTML content.</p>",
        "size": 45,
        "type": "file"
    }
    ```

- **Error Response:**
  - **Code:** 500 Internal Server Error
  - **Content:** `Something broke!`

## Features

- **Markdown Processing**: The server automatically converts markdown content to HTML using the `markdown-it` library
- **GitHub Flavored Markdown**: Supports GFM features for better compatibility
- **Dual Format**: Returns both raw markdown (`content`) and processed HTML (`html`) for maximum flexibility

## Deployment

The application is designed to be deployed using Docker. The repository includes a `docker-compose.yml` file that orchestrates the `server`, `githuber`, and `nginx` services.

### Prerequisites

- Docker
- Docker Compose

### Running the application

1. Navigate to the root of the `giran` repository.
2. Run the following command to build and start the services in detached mode:

    ```bash
    docker-compose up -d --build
    ```

3. The application will be available at `http://localhost`.

    - API requests to `/api/articles` will be routed to the `server` service.
    - Other requests will be routed to the `githuber` service.

### Services

- **server**: The main Bun application that provides the API endpoints.
- **githuber**: A Bun service that the `server` app depends on to get data from GitHub.
- **nginx**: A reverse proxy that routes requests to the appropriate service.
