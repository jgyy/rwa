# RWA Platform Makefile

.PHONY: help install dev build test clean docker-up docker-down

# Default target
help:
	@echo "Available commands:"
	@echo "  make install      - Install all dependencies"
	@echo "  make dev          - Start development servers"
	@echo "  make build        - Build all projects"
	@echo "  make test         - Run all tests"
	@echo "  make clean        - Clean all build artifacts"
	@echo "  make docker-up    - Start Docker services"
	@echo "  make docker-down  - Stop Docker services"
	@echo "  make setup        - Initial project setup"

# Initial setup
setup:
	@echo "Setting up RWA Platform..."
	cp .env.example .env
	cd rwa-frontend && cp .env.example .env.local
	cd rwa-backend && cp .env.example .env
	cd rwa-contracts && cp .env.example .env
	make install
	@echo "Setup complete! Edit .env files with your configuration."

# Install dependencies
install:
	@echo "Installing frontend dependencies..."
	cd rwa-frontend && npm install
	@echo "Installing backend dependencies..."
	cd rwa-backend && npm install
	@echo "Installing contracts dependencies..."
	cd rwa-contracts && npm install
	@echo "All dependencies installed!"

# Development
dev:
	@echo "Starting development servers..."
	concurrently \
		"cd rwa-frontend && npm run dev" \
		"cd rwa-backend && npm run dev" \
		"cd rwa-contracts && npx hardhat node"

# Build all projects
build:
	@echo "Building frontend..."
	cd rwa-frontend && npm run build
	@echo "Building backend..."
	cd rwa-backend && npm run build
	@echo "Compiling contracts..."
	cd rwa-contracts && npm run compile

# Run tests
test:
	@echo "Testing frontend..."
	cd rwa-frontend && npm test
	@echo "Testing backend..."
	cd rwa-backend && npm test
	@echo "Testing contracts..."
	cd rwa-contracts && npm test

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf rwa-frontend/.next rwa-frontend/out
	rm -rf rwa-backend/dist
	rm -rf rwa-contracts/artifacts rwa-contracts/cache rwa-contracts/typechain-types
	@echo "Clean complete!"

# Docker commands
docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-build:
	docker compose build

docker-logs:
	docker compose logs -f

docker-clean:
	docker compose down -v
	docker system prune -f

# Database commands
db-migrate:
	cd rwa-backend && npm run migrate

db-studio:
	cd rwa-backend && npm run studio

db-seed:
	cd rwa-backend && npm run seed

# Contract commands
contracts-compile:
	cd rwa-contracts && npx hardhat compile

contracts-deploy:
	cd rwa-contracts && npx hardhat run scripts/deploy.js --network localhost

contracts-verify:
	cd rwa-contracts && npm run verify

# Monitoring
monitor-start:
	docker compose up -d prometheus grafana

monitor-stop:
	docker compose stop prometheus grafana