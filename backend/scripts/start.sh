#!/bin/bash

# Try to run migrations, but continue if they fail
alembic upgrade head || echo "Migration failed, but continuing..."

# Start the application
if [ "$APP_ENV" = "production" ] || [ "$APP_ENV" = "staging" ] ; then
    uvicorn main:app --host 0.0.0.0 --port $PORT
else
    uvicorn main:app --host 0.0.0.0 --port $PORT --reload
fi 