#!/bin/bash

# Wait for database to be ready (if using external database)
echo "Starting Feedback System Backend..."

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Seed the database if it doesn't exist
if [ ! -f "feedback.db" ]; then
    echo "Seeding database with initial data..."
    python seed.py
fi

# Start the application
echo "Starting FastAPI server..."
exec uvicorn main:app --host 0.0.0.0 --port 8000 