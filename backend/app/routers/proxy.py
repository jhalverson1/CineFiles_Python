from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import httpx

router = APIRouter()

@router.get("/image/{size}/{file_path:path}")
async def proxy_image(size: str, file_path: str):
    tmdb_url = f"https://image.tmdb.org/t/p/{size}/{file_path}"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(tmdb_url)
            response.raise_for_status()
            
            return StreamingResponse(
                content=response.iter_bytes(),
                media_type=response.headers.get("content-type", "image/jpeg"),
                headers={
                    "Cache-Control": "public, max-age=31536000"  # Cache for 1 year
                }
            )
        except httpx.HTTPError as e:
            raise HTTPException(status_code=404, detail="Image not found") 