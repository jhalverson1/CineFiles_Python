"""
CineFiles Backend API

This is the main FastAPI application module that sets up the backend server for CineFiles.
It handles API routing, middleware configuration, database initialization, and CORS settings.

Key Components:
- FastAPI application setup with versioned API endpoints
- Database initialization and connection management
- Authentication and authorization routes
- Movie and person data management
- User lists functionality
- CORS configuration for frontend communication

The API follows RESTful principles and uses async/await for efficient request handling.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import get_settings
from app.database.database import init_db
from app.routers import auth, movies, proxy, person, lists
import logging

settings = get_settings()
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI application.
    Handles startup and shutdown events.
    """
    # Startup
    await init_db()
    yield
    # Shutdown
    # Add cleanup code here if needed

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan,
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(movies.router, prefix="/api/movies", tags=["movies"])
app.include_router(proxy.router, prefix="/api/proxy", tags=["proxy"])
app.include_router(person.router, prefix="/api/person", tags=["person"])
app.include_router(lists.router, prefix="/api/lists", tags=["lists"])