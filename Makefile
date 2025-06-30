.PHONY: help start stop restart logs clean build dev install test \
        client-install client-dev client-build client-preview \
        server-install server-build server-start server-dev server-test \
        githuber-install githuber-build githuber-start githuber-dev githuber-watch githuber-clean

# Default target - show help
help:
	@echo "🚀 Giran Article Reader - Available Commands"
	@echo ""
	@echo "📦 Main Deployment Commands:"
	@echo "  make start       - Build and start all services (production)"
	@echo "  make stop        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo "  make logs        - Show logs from all services"
	@echo "  make clean       - Clean up containers, networks, and images"
	@echo "  make build       - Build all Docker images"
	@echo ""
	@echo "🛠️  Development Commands:"
	@echo "  make dev         - Start all services in development mode"
	@echo "  make install     - Install dependencies for all services"
	@echo "  make test        - Run tests for all services"
	@echo ""
	@echo "🌐 Client Commands (Astro App):"
	@echo "  make client-install  - Install client dependencies"
	@echo "  make client-dev      - Start client in development mode"
	@echo "  make client-build    - Build client for production"
	@echo "  make client-preview  - Preview production build"
	@echo ""
	@echo "🔧 Server Commands (API):"
	@echo "  make server-install  - Install server dependencies"
	@echo "  make server-dev      - Start server in development mode"
	@echo "  make server-build    - Build server"
	@echo "  make server-start    - Start server in production mode"
	@echo "  make server-test     - Run server tests"
	@echo ""
	@echo "📚 Githuber Commands (GitHub Service):"
	@echo "  make githuber-install - Install githuber dependencies"
	@echo "  make githuber-dev     - Start githuber in development mode"
	@echo "  make githuber-build   - Build githuber"
	@echo "  make githuber-start   - Start githuber in production mode"
	@echo "  make githuber-clean   - Clean githuber cache"
	@echo ""

# ===========================================
# 📦 Main Deployment Commands
# ===========================================

start:
	@echo "🚀 Starting Giran Article Reader..."
	@chmod +x deploy.sh
	@./deploy.sh start

stop:
	@echo "🛑 Stopping all services..."
	@./deploy.sh stop

restart:
	@echo "🔄 Restarting all services..."
	@./deploy.sh restart

logs:
	@echo "📋 Showing logs from all services..."
	@./deploy.sh logs

clean:
	@echo "🧹 Cleaning up all containers and images..."
	@./deploy.sh clean

build:
	@echo "🔨 Building all Docker images..."
	@docker-compose build

# ===========================================
# 🛠️  Development Commands
# ===========================================

dev: install
	@echo "🛠️  Starting development environment..."
	@echo "🌐 Client will be available at: http://localhost:4321"
	@echo "🔧 Server will be available at: http://localhost:3000"
	@echo ""
	@echo "Starting services in parallel..."
	@trap 'kill 0' EXIT; \
	make client-dev & \
	make server-dev & \
	make githuber-dev & \
	wait

install: client-install server-install githuber-install
	@echo "✅ All dependencies installed!"

test: server-test
	@echo "✅ All tests completed!"

# ===========================================
# 🌐 Client Commands (Astro App)
# ===========================================

client-install:
	@echo "📦 Installing client dependencies..."
	@cd client && npm install

client-dev:
	@echo "🌐 Starting client development server..."
	@cd client && npm run dev

client-build:
	@echo "🔨 Building client for production..."
	@cd client && npm run build

client-preview:
	@echo "👀 Previewing client production build..."
	@cd client && npm run preview

# ===========================================
# 🔧 Server Commands (API)
# ===========================================

server-install:
	@echo "📦 Installing server dependencies..."
	@cd server && npm install

server-build:
	@echo "🔨 Building server..."
	@cd server && npm run build

server-start:
	@echo "🚀 Starting server in production mode..."
	@cd server && npm run start

server-dev:
	@echo "🔧 Starting server in development mode..."
	@cd server && npm run dev

server-test:
	@echo "🧪 Running server tests..."
	@cd server && npm run test

# ===========================================
# 📚 Githuber Commands (GitHub Service)
# ===========================================

githuber-install:
	@echo "📦 Installing githuber dependencies..."
	@cd githuber && npm install

githuber-build:
	@echo "🔨 Building githuber..."
	@cd githuber && npm run build

githuber-start:
	@echo "🚀 Starting githuber in production mode..."
	@cd githuber && npm run start

githuber-dev:
	@echo "📚 Starting githuber in development mode..."
	@cd githuber && npm run dev

githuber-watch:
	@echo "👀 Starting githuber in watch mode..."
	@cd githuber && npm run watch

githuber-clean:
	@echo "🧹 Cleaning githuber cache..."
	@cd githuber && npm run clean

# ===========================================
# 🚀 Quick Commands (Aliases)
# ===========================================

up: start
down: stop
ps:
	@docker-compose ps 