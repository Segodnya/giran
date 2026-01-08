.PHONY: help install test \
	start-prod start-dev \
	stop-prod stop-dev \
	restart-prod restart-dev \
	logs-prod logs-dev \
	build-prod build-dev \
	clean-prod clean-dev \
	ps-prod ps-dev

# Default target - show help
help:
	@echo "🚀 Giran Article Reader - Monolith Commands"
	@echo ""
	@echo "📦 Production (docker compose --profile prod):"
	@echo "  make start-prod    - Start app (prod)"
	@echo "  make stop-prod     - Stop app (prod)"
	@echo "  make restart-prod  - Restart app (prod)"
	@echo "  make logs-prod     - Tail logs (prod)"
	@echo "  make build-prod    - Build image (prod)"
	@echo "  make clean-prod    - Remove prod containers, networks, images"
	@echo "  make ps-prod       - Show prod containers"
	@echo ""
	@echo "🛠️  Development (docker compose --profile dev):"
	@echo "  make start-dev    - Start app (dev, HMR)"
	@echo "  make stop-dev     - Stop app (dev)"
	@echo "  make restart-dev  - Restart app (dev)"
	@echo "  make logs-dev     - Tail logs (dev)"
	@echo "  make build-dev    - Build image (dev)"
	@echo "  make clean-dev    - Remove dev containers, networks, images"
	@echo "  make ps-dev       - Show dev containers"
	@echo ""
	@echo "📚 Local (Bun):"
	@echo "  make install      - Install deps locally with Bun"
	@echo "  make test         - Run tests locally with Bun"
	@echo ""
	@echo ""

# ===========================================
# 📦 Main Deployment Commands
# ===========================================

start-prod:
	@echo "🚀 Starting app (production profile)..."
	@docker compose --profile prod up -d --build

stop-prod:
	@echo "🛑 Stopping production profile..."
	@docker compose --profile prod down

stop-dev:
	@echo "🛑 Stopping development profile..."
	@docker compose --profile dev down

restart-prod:
	@echo "🔄 Restarting production profile..."
	@docker compose --profile prod down && docker compose --profile prod up -d --build

restart-dev:
	@echo "🔄 Restarting development profile..."
	@docker compose --profile dev down && docker compose --profile dev up --build

logs-prod:
	@echo "📋 Showing production logs..."
	@docker compose --profile prod logs -f --tail=100

logs-dev:
	@echo "📋 Showing development logs..."
	@docker compose --profile dev logs -f --tail=100

build:
	@echo "🔨 Building Docker image (all services)..."
	@docker compose build

# ===========================================
# 🛠️  Development Commands
# ===========================================

start-dev:
	@echo "🛠️  Starting app in development (HMR, dev profile)..."
	@docker compose --profile dev up --build

install:
	@echo "📦 Installing dependencies with Bun..."
	@bun install

test:
	@echo "🧪 Running tests with Bun..."
	@bun test

build-prod:
	@echo "🔨 Building Docker image (prod)..."
	@docker compose --profile prod build

build-dev:
	@echo "🔨 Building Docker image (dev)..."
	@docker compose --profile dev build

clean-prod:
	@echo "🧹 Cleaning prod containers, networks, and images..."
	@docker compose --profile prod down --rmi local --volumes --remove-orphans

clean-dev:
	@echo "🧹 Cleaning dev containers, networks, and images..."
	@docker compose --profile dev down --rmi local --volumes --remove-orphans

ps-prod:
	@docker compose --profile prod ps

ps-dev:
	@docker compose --profile dev ps
