# Stage 1: Build the Next.js frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# Build the static export (creates /app/frontend/out)
RUN npm run build

# Stage 2: Build the FastAPI backend and serve frontend
FROM python:3.11-slim
WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy the static frontend build from Stage 1
COPY --from=frontend-builder /app/frontend/out ./frontend_build

# Set environment variables for production
ENV DATABASE_URL="sqlite:///./aigraops.db"
ENV PORT=10000

# Expose the port Render expects
EXPOSE 10000

# Start FastAPI, binding to 0.0.0.0 and the PORT environment variable
CMD uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT}
