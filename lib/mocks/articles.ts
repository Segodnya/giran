import { Article } from '../types/article';

const MOCK_ARTICLES: Article[] = [
  {
    id: 'astro',
    title: 'Introduction to Astro Framework',
    slug: 'astro',
    content: `# Introduction to Astro Framework 🚀

Astro is a modern static site generator designed to create fast and optimized web applications. It enables developers to build websites that are not only lightning-fast but also efficient in terms of performance and user experience. With its innovative approach to rendering, Astro allows developers to use their favorite JavaScript frameworks while delivering minimal JavaScript to the client.

## Key Features 🌟

1. **Partial Hydration**:
   Astro's unique partial hydration feature enables developers to send static HTML to the browser and only load the necessary JavaScript when interactivity is required. This results in faster load times and a smoother user experience.

2. **Framework Agnostic**:
   One of Astro's standout features is its flexibility regarding frameworks. You can integrate React, Vue, Svelte, or any other popular framework seamlessly. This allows developers to use the best tools for their projects without being locked into a single ecosystem.

3. **Static Site Generation (SSG)**:
   Astro is optimized for static site generation, allowing developers to pre-render pages at build time. This makes it ideal for blogs, documentation sites, and any content-focused websites.

4. **Markdown Support**:
   With Astro, it's easy to include content written in Markdown. This is particularly beneficial for content creators who prefer a simpler writing format. Astro can transform Markdown files into static HTML effortlessly.

5. **SEO-Friendly**:
   Since Astro generates static HTML, it's inherently SEO-friendly. Search engines can crawl and index the content easily, improving website visibility.`,
    excerpt:
      'Build faster websites with Astro - a modern static site generator with partial hydration and framework agnostic approach.',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'react',
    title: 'Getting Started with React',
    slug: 'react',
    content: `# Getting Started with React ⚛️

React is a JavaScript library for building user interfaces with a focus on component-based architecture. It allows developers to create reusable UI components that efficiently manage state and render updates.

## Core Concepts

1. **Components**: Reusable pieces of UI that encapsulate structure and behavior.
2. **JSX**: A syntax extension that allows you to write HTML-like code in JavaScript.
3. **State**: Data that changes over time and triggers re-renders.
4. **Props**: Read-only attributes passed from parent to child components.
5. **Hooks**: Functions that let you use state and other React features.

## Benefits

- **Efficient Rendering**: React uses a virtual DOM to optimize updates
- **Large Ecosystem**: Extensive library support for routing, state management, and more
- **Strong Community**: Widely adopted with abundant learning resources`,
    excerpt:
      'Learn the fundamentals of React, including components, JSX, state management, and hooks.',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-14T00:00:00Z',
  },
  {
    id: 'docker',
    title: 'Docker Containerization Basics',
    slug: 'docker',
    content: `# Docker Containerization Basics 🐳

Docker is a containerization platform that packages applications and their dependencies into isolated containers. This ensures consistent behavior across different environments.

## What are Containers?

Containers are lightweight, standalone packages that contain everything needed to run an application:
- Code
- Runtime
- System tools
- Libraries
- Settings

## Key Advantages

1. **Consistency**: Same behavior in development, testing, and production
2. **Isolation**: Applications don't interfere with each other
3. **Portability**: Run anywhere Docker is installed
4. **Efficiency**: Lightweight compared to virtual machines
5. **Scalability**: Easy to scale applications horizontally

## Docker Components

- **Images**: Blueprint for creating containers
- **Containers**: Running instances of images
- **Registry**: Repository for storing and sharing images
- **Dockerfile**: Configuration file for building images`,
    excerpt:
      'Understand Docker containerization, its benefits, and how to package applications for deployment.',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-13T00:00:00Z',
  },
  {
    id: 'express',
    title: 'Building APIs with Express.js',
    slug: 'express',
    content: `# Building APIs with Express.js 🚀

Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. It's perfect for building REST APIs.

## Express Basics

Express provides:
- Routing: Define endpoints for different HTTP methods
- Middleware: Process requests before they reach route handlers
- Request/Response handling: Easy access to request data and response methods
- Error handling: Comprehensive error management

## Building REST APIs

A typical REST API with Express includes:
1. Route definitions for CRUD operations
2. Middleware for authentication and validation
3. Database integration for data persistence
4. Error handling and logging

## Best Practices

- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Implement consistent error responses
- Use middleware for cross-cutting concerns
- Validate input data
- Document your API endpoints`,
    excerpt:
      'Master Express.js for building scalable REST APIs with robust routing and middleware support.',
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z',
  },
  {
    id: 'mongo',
    title: 'MongoDB: NoSQL Database Guide',
    slug: 'mongo',
    content: `# MongoDB: NoSQL Database Guide 📊

MongoDB is a NoSQL, document-oriented database that stores data in flexible JSON-like documents. It's designed for scalability and flexibility.

## Document Model

MongoDB stores data in BSON (Binary JSON) format:
- Documents are similar to JSON objects
- Collections are groups of documents
- No predefined schema is required

## Key Features

1. **Flexibility**: Schema-less design allows easy modifications
2. **Scalability**: Horizontal scaling through sharding
3. **Indexing**: Supports various indexing strategies for performance
4. **Aggregation**: Powerful pipeline for data transformation
5. **Replication**: Automatic data replication for high availability

## Data Structure Example

\`\`\`json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "tags": ["developer", "mongodb"]
}
\`\`\`

## Use Cases

- Content Management Systems
- Real-time analytics
- IoT applications
- Mobile app backends`,
    excerpt:
      'Explore MongoDB as a flexible NoSQL database solution with powerful querying and aggregation capabilities.',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-11T00:00:00Z',
  },
];

export const getMockArticles = (): Article[] => {
  return MOCK_ARTICLES;
};

export const getMockArticle = (id: string): Article | null => {
  return MOCK_ARTICLES.find((article) => article.id === id) || null;
};
