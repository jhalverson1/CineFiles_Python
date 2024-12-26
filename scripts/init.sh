#!/bin/bash
set -e

# Run migrations
python -m alembic upgrade head

# Start the application with the correct port from environment variable
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080} 