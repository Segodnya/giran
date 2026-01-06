# Build stage: compile to standalone binary
FROM oven/bun:1-alpine AS builder
WORKDIR /usr/src/app

# Install dependencies
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Compile to standalone executable
RUN bun build src/index.ts --compile --outfile server

# Final stage: minimal Alpine (smallest viable option)
FROM alpine:3.19
WORKDIR /app

# Install only required runtime libraries
RUN apk add --no-cache libstdc++ libgcc

# Copy only the compiled binary
COPY --from=builder /usr/src/app/server /app/server

EXPOSE 3000

# Run the compiled binary
CMD ["/app/server"]
