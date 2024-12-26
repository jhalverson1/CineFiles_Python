from fastapi import APIRouter, HTTPException
import httpx
from app.utils.tmdb import get_tmdb_url, HEADERS

router = APIRouter()

@router.get("/{person_id}")
async def get_person_details(person_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            get_tmdb_url(f"person/{person_id}"),
            headers=HEADERS
        )
        return response.json() 