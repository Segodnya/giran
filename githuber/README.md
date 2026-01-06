# Githuber

Bun app to serve articles from a main branch of public Git repository.

TypeScript, Elysia.

Simple independent Bun service that uses Github API to provide API endpoints to get the list of content items and a specific item with a query as a plain markdown to be served with another local app (we're using our own repository folder - https://github.com/Segodnya/giran/tree/main/content).

## Setup

### Install dependencies

```bash
bun install
```

### Create a `.env` file in the root of the project with the following content

```bash
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_REPO_OWNER=owner_of_the_repo
GITHUB_REPO_NAME=name_of_the_repo
GITHUB_REPO_FOLDER=path/to/articles/folder
PORT=3001
```

## Running the server

To run the server in development mode (with hot-reloading):

```bash
bun run dev
```

To run in production mode:

```bash
bun run start
```

The server will be available at `http://localhost:3001` (or the port you specified in `.env`).

## Testing

Run tests with Bun's built-in test runner:

```bash
bun test
```

For watch mode:

```bash
bun test --watch
```

## API Endpoints

- `GET /articles`: Returns a list of all markdown articles in the specified repository folder.
- `GET /articles/:name`: Returns the raw markdown content of a specific article.
