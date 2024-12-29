#!/bin/bash

set -e  # Exit on error

run_migrations() {
    echo "Running database migrations..."
    alembic upgrade head
    if [ $? -eq 0 ]; then
        echo "Migrations completed successfully"
    else
        echo "Migration failed!"
        exit 1
    fi
}

# Start the application without waiting for database in production
if [ "$APP_ENV" = "production" ] || [ "$APP_ENV" = "staging" ] ; then
    run_migrations
    # Start the application
    uvicorn main:app --host 0.0.0.0 --port $PORT
else
    # Development mode - wait for local database
    echo "Waiting for database..."
    while ! nc -z db 5432; do
      sleep 1
    done
    echo "Database is ready!"
    
    run_migrations
    
    # Start with reload in development
    uvicorn main:app --host 0.0.0.0 --port $PORT --reload
fi 