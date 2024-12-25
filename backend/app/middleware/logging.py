from fastapi import Request
import logging

logger = logging.getLogger(__name__)

def setup_request_logging(app):
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        logger.debug(f"Incoming request: {request.method} {request.url}")
        logger.debug(f"Headers: {request.headers}")
        response = await call_next(request)
        logger.debug(f"Response status: {response.status_code}")
        return response 