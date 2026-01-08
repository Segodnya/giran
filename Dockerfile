# Multi-stage Dockerfile for Next.js 16 monolith using Bun

# ---- Build stage ----
FROM oven/bun:1 AS builder
WORKDIR /app

# Install dependencies first (better caching)
COPY package.json .
# Copy bun lockfile if present
COPY bun.lockb* ./
RUN bun install

# Copy source
COPY . .

# Build Next.js app
RUN bun run build

# ---- Runtime stage ----
FROM oven/bun:1 AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built artifacts and runtime deps
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/public ./public

# Expose Next.js port
EXPOSE 3000

# Start the production server
CMD ["bun", "run", "start"]
