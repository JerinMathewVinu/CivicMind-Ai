.PHONY: help dev backend frontend lint test build up down

help:
	@echo "CivicMind AI commands:"
	@echo "  make up        - docker compose up --build"
	@echo "  make down      - docker compose down"
	@echo "  make backend   - run FastAPI locally"
	@echo "  make frontend  - run Next.js locally"

up:
	docker compose up --build

down:
	docker compose down

backend:
	cd backend && uvicorn app.main:app --reload --port 8000

frontend:
	cd frontend && npm run dev