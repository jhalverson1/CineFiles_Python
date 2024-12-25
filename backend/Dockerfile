FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Create necessary directories
RUN mkdir -p /app/alembic/versions

# Set environment variables
ENV PORT=8080
ENV PYTHONPATH=/app

# Default to development mode
ENV APP_ENV=development

# Use a script to determine startup command based on environment
CMD if [ "$APP_ENV" = "production" ] ; then \
        alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port $PORT ; \
    else \
        uvicorn main:app --host 0.0.0.0 --port $PORT --reload ; \
    fi