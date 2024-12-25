from fastapi import FastAPI
import os
import logging
import uvicorn
from app.core.config import get_settings
from app.middleware.cors import setup_cors
from app.middleware.logging import setup_request_logging
from app.api.endpoints import movies, people

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

def create_application() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
    )

    # Setup middleware
    setup_cors(app)
    setup_request_logging(app)

    # Include routers
    app.include_router(
        movies.router,
        prefix=f"{settings.API_V1_STR}/movies",
        tags=["movies"]
    )
    app.include_router(
        people.router,
        prefix=f"{settings.API_V1_STR}/person",
        tags=["people"]
    )

    @app.get("/")
    async def root():
        return {
            "status": "healthy",
            "version": settings.VERSION,
            "endpoints": [
                "/api/movies/popular",
                "/api/movies/top-rated",
                "/api/movies/upcoming",
                "/api/movies/news"
            ]
        }

    return app

app = create_application()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)