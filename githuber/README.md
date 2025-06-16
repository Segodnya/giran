# Githuber

Node.js app to serve articles from a main branch of public Git repository.

TypeScript, Express.

Simple independent node.js service that uses Github API to provide API endpoints to get the list of content items and a specific item with a query as a plain markdown to be served with another local Node.js app (we're using our own repository folder - https://github.com/Segodnya/giran/tree/main/content).

## Setup

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Create a `.env` file in the root of the project with the following content:
    ```
    GITHUB_TOKEN=your_github_personal_access_token
    GITHUB_REPO_OWNER=owner_of_the_repo
    GITHUB_REPO_NAME=name_of_the_repo
    GITHUB_REPO_FOLDER=path/to/articles/folder
    PORT=3001
    ```

## Running the server

To run the server in development mode (with hot-reloading):
```bash
npm run dev
```

To build the project and run in production mode:
```bash
npm run build
npm start
```

The server will be available at `http://localhost:3001` (or the port you specified in `.env`).

## API Endpoints

*   `GET /articles`: Returns a list of all markdown articles in the specified repository folder.
*   `GET /articles/:name`: Returns the raw markdown content of a specific article.
