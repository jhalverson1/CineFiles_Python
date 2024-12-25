import httpx
from fastapi import HTTPException
import logging
from .config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class TMDBClient:
    BASE_URL = "https://api.themoviedb.org/3"
    
    @staticmethod
    async def _make_request(endpoint: str, params: dict = None):
        headers = {
            "accept": "application/json",
            "Authorization": f"Bearer {settings.TMDB_BEARER_TOKEN}"
        }
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{TMDBClient.BASE_URL}{endpoint}",
                    headers=headers,
                    params=params
                )
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Error fetching from TMDB: {endpoint}"
                    )
                return response.json()
        except Exception as e:
            logger.error(f"Error fetching from TMDB: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    @classmethod
    async def get_popular_movies(cls):
        return await cls._make_request("/movie/popular", {"language": "en-US", "page": 1})

    @classmethod
    async def get_top_rated_movies(cls):
        return await cls._make_request("/movie/top_rated", {"language": "en-US", "page": 1})

    @classmethod
    async def get_upcoming_movies(cls):
        return await cls._make_request("/movie/upcoming", {"language": "en-US", "page": 1})

    @classmethod
    async def search_movies(cls, query: str):
        return await cls._make_request("/search/movie", {"query": query})

    @classmethod
    async def get_movie_details(cls, movie_id: int):
        return await cls._make_request(f"/movie/{movie_id}")

    @classmethod
    async def get_movie_credits(cls, movie_id: int):
        return await cls._make_request(f"/movie/{movie_id}/credits")

    @classmethod
    async def get_movie_videos(cls, movie_id: int):
        return await cls._make_request(f"/movie/{movie_id}/videos")

    @classmethod
    async def get_person_details(cls, person_id: int):
        return await cls._make_request(f"/person/{person_id}/external_ids") 