.PHONY: build run-api run-sync run-async clean logs help

# Variables
DC=docker compose

help:
	@echo "Available commands:"
	@echo "  make build      - Build all Docker images"
	@echo "  make run-api    - Start the API service"
	@echo "  make run-sync   - Run synchronous tests"
	@echo "  make run-async  - Run asynchronous tests"
	@echo "  make compare-tests - Run both tests and show comparison"
	@echo "  make stop       - Stop all services"
	@echo "  make clean      - Stop and remove all containers"
	@echo "  make logs       - Show logs from all services"
	@echo "  make logs-api   - Show logs from API service"
	@echo "  make rebuild    - Rebuild and restart all services"

build:
	mkdir -p data stats
	$(DC) build

run-api:
	$(DC) up -d api
	@echo "Waiting for API to be ready..."
	@sleep 10
	@echo "API is running at http://localhost:8000"

run-sync: run-api
	@echo "\n=== Running Synchronous Tests ==="
	$(DC) run --rm sync-test | tee sync_results.txt
	@echo "\nResults saved to sync_results.txt"

run-async: run-api
	@echo "\n=== Running Asynchronous Tests ==="
	$(DC) run --rm async-test | tee async_results.txt
	@echo "\nResults saved to async_results.txt"

compare-tests: run-sync run-async
	@echo "\n=== Test Comparison ==="
	$(DC) run --rm sync-test python -c "from test_stats import load_stats, compare_stats; \
		sync_stats = load_stats('sync_stats.json'); \
		async_stats = load_stats('async_stats.json'); \
		compare_stats(sync_stats, async_stats)"

stop:
	$(DC) stop

clean:
	$(DC) down -v
	rm -f data/facilities.db
	rm -f stats/*.json

logs:
	$(DC) logs -f

logs-api:
	$(DC) logs -f api

rebuild: clean build run-api 