from fastapi import APIRouter
from ...core.tmdb_client import TMDBClient

router = APIRouter()

@router.get("/{person_id}")
async def get_person_details(person_id: int):
    return await TMDBClient.get_person_details(person_id) 