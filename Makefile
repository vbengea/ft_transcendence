#!make

NAME = pong
IMAGE = $(NAME):latest
CONTAINER = $(NAME)
ENV_FILE = .env

# Production deployment targets
.PHONY: all setup build run stop restart clean logs shell help

all: help

## setup: Initialize environment for production (create .env if missing)
setup:
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "Creating .env from .env.example..."; \
		cp .env.example $(ENV_FILE); \
		echo ""; \
		echo "⚠️  IMPORTANT: Please edit .env file with your production values!"; \
		echo ""; \
	else \
		echo ".env file already exists"; \
	fi

## build: Build Docker image
build:
	@echo "Building Docker image..."
	docker build -t $(IMAGE) .

## run: Build and run the application (production mode)
run: setup build
	@echo "Starting application..."
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "Error: .env file not found!"; \
		exit 1; \
	fi
	@docker stop $(CONTAINER) 2>/dev/null || true
	@docker rm $(CONTAINER) 2>/dev/null || true
	docker run -d \
		--name $(CONTAINER) \
		--restart unless-stopped \
		--env-file $(ENV_FILE) \
		-p 3001:3001 \
		-v $(PWD)/db:/app/db \
		$(IMAGE)
	@echo ""
	@echo "✅ Application started successfully!"
	@echo "Container name: $(CONTAINER)"
	@echo "Port: 3001"
	@echo "Logs: make logs"

## stop: Stop the running container
stop:
	@echo "Stopping container..."
	docker stop $(CONTAINER)

## restart: Restart the application
restart: stop run

## clean: Stop and remove container and image
clean:
	@echo "Cleaning up..."
	@docker stop $(CONTAINER) 2>/dev/null || true
	@docker rm $(CONTAINER) 2>/dev/null || true
	@docker rmi $(IMAGE) 2>/dev/null || true
	@echo "✅ Cleanup complete"

## logs: Show container logs
logs:
	docker logs -f $(CONTAINER)

## shell: Open a shell in the running container
shell:
	docker exec -it $(CONTAINER) sh

## help: Show this help message
help:
	@echo "Available targets:"
	@sed -n 's/^##//p' ${MAKEFILE_LIST} | column -t -s ':' | sed -e 's/^/ /'

