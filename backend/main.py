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
    Manages the application lifecycle.
    
    Responsibilities:
    - Configures logging with appropriate log levels
    - Initializes database connection
    - Handles graceful shutdown
    
    Args:
        app: FastAPI application instance
    """
    # Setup logging configuration
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    # Set higher log levels for noisy modules
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    
    await init_db()
    yield
    logger.info("Shutting down application")

# Initialize FastAPI application with configuration
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    debug=settings.DEBUG,
    lifespan=lifespan
)

# Include routers with their respective prefixes and tags
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(movies.router, prefix="/api/movies", tags=["movies"])
app.include_router(proxy.router, prefix="/api/proxy", tags=["proxy"])
app.include_router(person.router, prefix="/api/person", tags=["person"])
app.include_router(lists.router, tags=["lists"])

# Configure CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

@app.on_event("startup")
async def log_routes():
    """
    Logs all registered routes on application startup for debugging purposes.
    """
    for route in app.routes:
        logger.info(f"Registered route: {route.path}")