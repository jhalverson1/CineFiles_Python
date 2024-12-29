"""
Proxy Router

This module handles image proxying functionality for TMDB images. It serves as an intermediary
between the frontend and TMDB's image service, providing caching and error handling.

Features:
- Secure image proxying from TMDB
- Image size transformation
- Response caching
- Error handling for missing images
- Content-type preservation

The proxy helps avoid CORS issues and provides a unified interface for image delivery
while maintaining TMDB's image quality and formats.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
import httpx
import logging
from app.core.config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()

@router.get("/image/{size}/{image_path:path}")
async def proxy_image(size: str, image_path: str):
    """
    Proxy and serve images from TMDB's image service.
    
    Args:
        size: TMDB image size specification (e.g., 'original', 'w500', 'w185')
        image_path: Path component of the TMDB image URL
    
    Returns:
        Response: Image binary data with appropriate headers:
            - Content-Type: Preserved from original image
            - Cache-Control: Set for long-term caching
            - Access-Control-Allow-Origin: Set for CORS
    """
    try:
        clean_path = image_path.lstrip('/')
        image_url = f"https://image.tmdb.org/t/p/{size}/{clean_path}"
        async with httpx.AsyncClient() as client:
            response = await client.get(image_url)
            response.raise_for_status()
            
            headers = {
                "Cache-Control": "public, max-age=31536000",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "*",
            }
            
            return Response(
                content=response.content,
                media_type=response.headers.get("content-type", "image/jpeg"),
                headers=headers
            )
    except Exception as e:
        logger.error(f"Failed to proxy image: {str(e)}")
        raise HTTPException(status_code=404, detail=f"Image not found: {str(e)}")

@router.options("/image/{size}/{image_path:path}")
async def proxy_image_options():
    """Handle OPTIONS requests for CORS preflight"""
    return Response(
        content="",
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400",
        }
    ) 