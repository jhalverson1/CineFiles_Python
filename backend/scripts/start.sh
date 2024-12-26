#!/bin/bash

# Wait for database to be ready
echo "Waiting for database..."
while ! nc -z db 5432; do
  sleep 1
done
echo "Database is ready!"

# Try to run migrations
echo "Running database migrations..."
alembic upgrade head || echo "Migration failed, but continuing..."

# Start the application
if [ "$APP_ENV" = "production" ] || [ "$APP_ENV" = "staging" ] ; then
    uvicorn main:app --host 0.0.0.0 --port $PORT
else
    uvicorn main:app --host 0.0.0.0 --port $PORT --reload
fi 