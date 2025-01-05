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
from app.routers.auth import router as auth_router
from app.routers.movies import router as movies_router
from app.routers.proxy import router as proxy_router
from app.routers.person import router as person_router
from app.routers.lists import router as lists_router
from app.routers.filter_settings import router as filter_settings_router
from app.core.logging_config import configure_logging
import logging.config
import logging

settings = get_settings()
logger = logging.getLogger(__name__)

# Configure logging
logging.config.dictConfig(configure_logging())

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
    expose_headers=["*"],
    max_age=3600
)

# API Routes
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(movies_router, prefix="/api/movies", tags=["movies"])
app.include_router(proxy_router, prefix="/api/proxy", tags=["proxy"])
app.include_router(person_router, prefix="/api/person", tags=["person"])
app.include_router(lists_router, prefix="/api/lists", tags=["lists"])
app.include_router(filter_settings_router, prefix="/api/filter-settings", tags=["filter-settings"])