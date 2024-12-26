from fastapi import APIRouter, HTTPException, Request
import httpx
from app.utils.tmdb import get_tmdb_url, HEADERS
from app.utils.scraper import scrape_movie_news
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/popular")
async def get_popular_movies():
    async with httpx.AsyncClient() as client:
        response = await client.get(
            get_tmdb_url("movie/popular"),
            headers=HEADERS
        )
        return response.json()

@router.get("/top-rated")
async def get_top_rated_movies():
    async with httpx.AsyncClient() as client:
        response = await client.get(
            get_tmdb_url("movie/top_rated"),
            headers=HEADERS
        )
        return response.json()

@router.get("/upcoming")
async def get_upcoming_movies():
    async with httpx.AsyncClient() as client:
        response = await client.get(
            get_tmdb_url("movie/upcoming"),
            headers=HEADERS
        )
        return response.json()

@router.get("/news")
async def get_movie_news():
    return await scrape_movie_news()

@router.get("/search")
async def search_movies(query: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            get_tmdb_url("search/movie"),
            params={"query": query},
            headers=HEADERS
        )
        return response.json()

@router.get("/{movie_id}")
async def get_movie_details(movie_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            get_tmdb_url(f"movie/{movie_id}"),
            headers=HEADERS
        )
        return response.json()

@router.get("/{movie_id}/credits")
async def get_movie_credits(movie_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            get_tmdb_url(f"movie/{movie_id}/credits"),
            headers=HEADERS
        )
        return response.json()

@router.get("/{movie_id}/videos")
async def get_movie_videos(movie_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            get_tmdb_url(f"movie/{movie_id}/videos"),
            headers=HEADERS
        )
        return response.json() 