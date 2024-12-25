from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from ...core.tmdb_client import TMDBClient
from ...utils.scraper import scrape_movie_news
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/popular")
async def get_popular_movies():
    return await TMDBClient.get_popular_movies()

@router.get("/top-rated")
async def get_top_rated_movies():
    return await TMDBClient.get_top_rated_movies()

@router.get("/upcoming")
async def get_upcoming_movies():
    return await TMDBClient.get_upcoming_movies()

@router.get("/news")
async def get_movie_news():
    try:
        logger.debug("Starting movie news fetch")
        news = await scrape_movie_news()
        logger.debug(f"Fetched {len(news) if news else 0} news items")
        if not news:
            logger.warning("No news items found")
            return {"error": "No news found", "items": []}
        return {"items": news}
    except Exception as e:
        logger.error(f"Error in get_movie_news: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch movie news: {str(e)}"
        )

@router.get("/search")
async def search_movies(query: str = Query(..., min_length=1)):
    return await TMDBClient.search_movies(query)

@router.get("/{movie_id}")
async def get_movie_details(movie_id: int):
    return await TMDBClient.get_movie_details(movie_id)

@router.get("/{movie_id}/credits")
async def get_movie_credits(movie_id: int):
    return await TMDBClient.get_movie_credits(movie_id)

@router.get("/{movie_id}/videos")
async def get_movie_videos(movie_id: int):
    return await TMDBClient.get_movie_videos(movie_id) 