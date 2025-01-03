#!/bin/bash

# Create test database
PGPASSWORD=postgres psql -U postgres -h localhost -p 5433 -c "DROP DATABASE IF EXISTS cinefiles_test;"
PGPASSWORD=postgres psql -U postgres -h localhost -p 5433 -c "CREATE DATABASE cinefiles_test;"

echo "Test database created successfully!" 