# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage - Node server (Astro SSR)
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist /app/dist

# Configure server port and host
ENV PORT=80
ENV HOST=0.0.0.0

EXPOSE 80

# Start Astro Node adapter server
CMD ["node", "dist/server/entry.mjs"]
