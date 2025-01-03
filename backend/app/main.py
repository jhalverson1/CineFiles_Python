from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers.auth import router as auth_router
from app.routers.movies import router as movies_router
from app.routers.proxy import router as proxy_router
from app.routers.person import router as person_router
from app.routers.lists import router as lists_router
from app.routers.filter_settings import router as filter_settings_router
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for CineFiles movie discovery platform",
    version="1.0.0",
    debug=settings.DEBUG
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(
    movies_router,
    prefix="/api/movies",
    tags=["movies"],
)

app.include_router(
    auth_router,
    prefix="/api/auth",
    tags=["auth"],
)

app.include_router(
    proxy_router,
    prefix="/api/proxy",
    tags=["proxy"],
)

app.include_router(
    person_router,
    prefix="/api/person",
    tags=["person"],
)

app.include_router(
    lists_router,
    prefix="/api/lists",
    tags=["lists"],
)

app.include_router(
    filter_settings_router,
    prefix="/api/filter-settings",
    tags=["filter-settings"],
)

@app.get("/")
async def root():
    """Root endpoint returning API status"""
    return {
        "status": "online",
        "version": "1.0.0",
        "message": "Welcome to CineFiles API"
    }

@app.on_event("startup")
async def startup_event():
    """Startup event handler"""
    logger.info("Starting up CineFiles API")

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event handler"""
    logger.info("Shutting down CineFiles API") 