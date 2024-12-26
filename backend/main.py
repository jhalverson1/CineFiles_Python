from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import get_settings
from app.database.database import init_db
from app.routers import auth, movies, proxy, person
import logging

settings = get_settings()
logger = logging.getLogger(__name__)

class APIVersionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path.startswith('/api/'):
            request.scope["path"] = request.url.path.replace('/api/', '/api/v1/')
        return await call_next(request)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup logging configuration
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    
    await init_db()
    yield
    logger.info("Shutting down application")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    debug=settings.DEBUG,
    lifespan=lifespan
)

# Add version middleware before routers
app.add_middleware(APIVersionMiddleware)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR + "/auth", tags=["auth"])
app.include_router(movies.router, prefix=settings.API_V1_STR + "/movies", tags=["movies"])
app.include_router(proxy.router, prefix=settings.API_V1_STR + "/proxy", tags=["proxy"])
app.include_router(person.router, prefix=settings.API_V1_STR + "/person", tags=["person"])

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=600
)