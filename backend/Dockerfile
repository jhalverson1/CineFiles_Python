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

# Ensure the script has the correct permissions
RUN chmod +x /app/scripts/start.sh && \
    # Convert possible Windows line endings to Unix
    sed -i 's/\r$//' /app/scripts/start.sh

# Use shell to execute the script
CMD ["sh", "/app/scripts/start.sh"]