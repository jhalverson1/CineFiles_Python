from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from ..core.config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()

def setup_cors(app):
    # Clean and normalize origins
    origins = list(set([origin.rstrip('/') for origin in settings.ALLOWED_ORIGINS if origin]))
    logger.debug(f"Configuring CORS with allowed origins: {origins}")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        max_age=3600,
    )

    @app.middleware("http")
    async def add_cors_headers(request: Request, call_next):
        response = await call_next(request)
        origin = request.headers.get("origin")
        if origin in origins:
            response.headers["Access-Control-Allow-Origin"] = origin
        return response 