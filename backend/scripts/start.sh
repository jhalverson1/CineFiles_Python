#!/bin/bash

# Start the application without waiting for database in production
if [ "$APP_ENV" = "production" ] || [ "$APP_ENV" = "staging" ] ; then
    # Run migrations
    alembic upgrade head || echo "Migration failed, but continuing..."
    # Start the application
    uvicorn main:app --host 0.0.0.0 --port $PORT
else
    # Development mode - wait for local database
    echo "Waiting for database..."
    while ! nc -z db 5432; do
      sleep 1
    done
    echo "Database is ready!"
    
    # Run migrations
    alembic upgrade head || echo "Migration failed, but continuing..."
    
    # Start with reload in development
    uvicorn main:app --host 0.0.0.0 --port $PORT --reload
fi 