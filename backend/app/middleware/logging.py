from fastapi import Request
import logging
import time

logger = logging.getLogger(__name__)

async def logging_middleware(request: Request, call_next):
    start_time = time.time()
    logger.info(f"Request started: {request.method} {request.url}")
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    logger.info(f"Request completed: {request.method} {request.url} - Status: {response.status_code} - Time: {process_time:.2f}s")
    
    return response 