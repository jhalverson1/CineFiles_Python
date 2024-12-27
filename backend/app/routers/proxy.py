from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
import httpx
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/image/{size}/{image_path:path}")
async def proxy_image(size: str, image_path: str):
    try:
        clean_path = image_path.lstrip('/')
        image_url = f"https://image.tmdb.org/t/p/{size}/{clean_path}"
        async with httpx.AsyncClient() as client:
            response = await client.get(image_url)
            response.raise_for_status()
            return Response(
                content=response.content,
                media_type=response.headers.get("content-type", "image/jpeg"),
                headers={"Cache-Control": "public, max-age=31536000"}
            )
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Image not found: {str(e)}") 