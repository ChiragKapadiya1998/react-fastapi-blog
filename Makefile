.PHONY: install run-frontend run-backend run clean

# Install dependencies for both frontend and backend
install:
	@echo "Installing frontend (React) dependencies..."
	npm install
	@echo "Setting up Python virtual environment and installing backend dependencies..."
	python3 -m venv venv
	./venv/bin/pip install -r backend/requirements.txt
	@echo "Installation complete! Run 'make run' to start both servers."

# Run frontend (React/Vite)
run-frontend:
	npm run dev

# Run backend (FastAPI)
run-backend:
	./venv/bin/uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# Run both concurrently
run:
	@echo "Starting both frontend and backend servers..."
	@echo "Backend will be available at http://localhost:8000"
	@echo "Frontend will be available at http://localhost:5173"
	@make -j2 run-backend run-frontend

# Clean up build files and virtual environments
clean:
	rm -rf node_modules dist venv backend/__pycache__
