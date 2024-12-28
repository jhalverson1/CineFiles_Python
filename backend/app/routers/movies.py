"""
Movies Router

This module handles all movie-related endpoints, integrating with TMDB API for movie data
and implementing custom movie news scraping functionality.

Features:
- Popular, top-rated, and upcoming movies listings
- Movie search functionality
- Detailed movie information retrieval
- Cast and crew information
- Movie trailers and videos
- Movie news aggregation from various sources

All movie data is sourced from TMDB API, while news is scraped from configured news sources.
Responses maintain TMDB's original structure for consistency and completeness.
"""

from fastapi import APIRouter, HTTPException, Request
import httpx
from app.utils.tmdb import get_tmdb_url, HEADERS
from app.utils.scraper import scrape_movie_news
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/popular")
async def get_popular_movies():
    """
    Retrieve a list of currently popular movies.
    
    Returns:
        dict: JSON response containing:
            - page: Current page number
            - results: List of movie objects with basic information
            - total_pages: Total number of available pages
            - total_results: Total number of movies
    
    Notes:
        - Results are paginated and sorted by popularity
        - Updates daily based on TMDB's popularity algorithm
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            get_tmdb_url("movie/popular"),
            headers=HEADERS
        )
        return response.json()

@router.get("/top-rated")
async def get_top_rated_movies():
    """
    Retrieve a list of top-rated movies of all time.
    
    Returns:
        dict: JSON response containing:
            - page: Current page number
            - results: List of movie objects with basic information
            - total_pages: Total number of available pages
            - total_results: Total number of movies
    
    Notes:
        - Results are sorted by vote average and minimum vote count
        - Provides a curated list of critically acclaimed films
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            get_tmdb_url("movie/top_rated"),
            headers=HEADERS
        )
        return response.json()

@router.get("/upcoming")
async def get_upcoming_movies():
    """
    Retrieve a list of upcoming movie releases.
    
    Returns:
        dict: JSON response containing:
            - page: Current page number
            - results: List of movie objects with basic information
            - total_pages: Total number of available pages
            - total_results: Total number of movies
    
    Notes:
        - Results are sorted by release date
        - Only includes movies with future release dates
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            get_tmdb_url("movie/upcoming"),
            headers=HEADERS
        )
        return response.json()

@router.get("/news")
async def get_movie_news():
    """
    Retrieve latest movie news from various sources.
    
    Returns:
        list: Collection of news articles, each containing:
            - title: Article title
            - url: Link to full article
            - source: Name of the news source
            - date: Publication date
    
    Notes:
        - News is scraped from multiple configured sources
        - Results are sorted by publication date (newest first)
    """
    return await scrape_movie_news()

@router.get("/search")
async def search_movies(query: str):
    """
    Search for movies by title or keywords.
    
    Args:
        query: Search term(s) to find movies
    
    Returns:
        dict: JSON response containing:
            - page: Current page number
            - results: List of matching movies
            - total_pages: Total number of available pages
            - total_results: Total number of matching movies
    
    Notes:
        - Searches through movie titles, original titles, and alternative titles
        - Results are sorted by relevance to the search query
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            get_tmdb_url("search/movie"),
            params={"query": query},
            headers=HEADERS
        )
        return response.json()

@router.get("/{movie_id}")
async def get_movie_details(movie_id: int):
    """
    Retrieve detailed information about a specific movie.
    
    Args:
        movie_id: TMDB ID of the movie
    
    Returns:
        dict: Comprehensive movie details including:
            - Basic information (title, overview, release date)
            - Production details (budget, revenue, runtime)
            - Associated companies and countries
            - Genres and spoken languages
            - Ratings and vote counts
    
    Notes:
        - Provides the most detailed view of a movie
        - Includes all available metadata from TMDB
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            get_tmdb_url(f"movie/{movie_id}"),
            headers=HEADERS
        )
        return response.json()

@router.get("/{movie_id}/credits")
async def get_movie_credits(movie_id: int):
    """
    Retrieve cast and crew information for a specific movie.
    
    Args:
        movie_id: TMDB ID of the movie
    
    Returns:
        dict: Credits information containing:
            - cast: List of actors and their characters
            - crew: List of crew members and their roles
    
    Notes:
        - Cast list is ordered by billing position
        - Includes department and job information for crew members
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            get_tmdb_url(f"movie/{movie_id}/credits"),
            headers=HEADERS
        )
        return response.json()

@router.get("/{movie_id}/videos")
async def get_movie_videos(movie_id: int):
    """
    Retrieve video content associated with a specific movie.
    
    Args:
        movie_id: TMDB ID of the movie
    
    Returns:
        dict: Collection of video information including:
            - Trailers
            - Teasers
            - Clips
            - Behind the scenes content
    
    Notes:
        - Includes videos from various sources (YouTube, Vimeo)
        - Contains metadata like title, site, size, and type
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            get_tmdb_url(f"movie/{movie_id}/videos"),
            headers=HEADERS
        )
        return response.json() 