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
- Watch providers information

All movie data is sourced from TMDB API, while news is scraped from configured news sources.
Responses maintain TMDB's original structure for consistency and completeness.
"""

from fastapi import APIRouter, HTTPException, Request
import httpx
from app.utils.tmdb import get_tmdb_url, HEADERS
from app.utils.scraper import scrape_movie_news
import logging
from datetime import datetime, timedelta
from typing import Optional, Tuple
import json

logger = logging.getLogger(__name__)
router = APIRouter()

def parse_range_param(param: Optional[str]) -> Optional[Tuple]:
    """Parse a string range parameter into a tuple.
    
    Args:
        param: String in format "[min,max]" or None
        
    Returns:
        Tuple of (min, max) or None if param is None
    """
    if not param:
        return None
    try:
        # Remove brackets and split by comma
        cleaned = param.strip('[]')
        min_val, max_val = map(float, cleaned.split(','))
        return (min_val, max_val)
    except Exception as e:
        logger.error(f"Error parsing range parameter {param}: {str(e)}")
        return None

@router.get("/popular")
async def get_popular_movies(page: int = 1):
    """
    Retrieve a list of currently popular movies.
    
    Args:
        page: Page number for pagination (default: 1)
    
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
            params={"page": page, "include_adult": "false"},
            headers=HEADERS
        )
        return response.json()

@router.get("/top-rated")
async def get_top_rated_movies(
    page: int = 1,
    year_range: Optional[str] = None,
    rating_range: Optional[str] = None,
    popularity_range: Optional[str] = None
):
    """
    Retrieve a list of top-rated movies using TMDB's discover API.
    
    Args:
        page: Page number for pagination (default: 1)
        year_range: Optional tuple of (start_year, end_year)
        rating_range: Optional tuple of (min_rating, max_rating)
        popularity_range: Optional tuple of (min_votes, max_votes)
    
    Returns:
        dict: JSON response containing:
            - page: Current page number
            - results: List of movie objects with basic information
            - total_pages: Total number of available pages
            - total_results: Total number of movies
    
    Notes:
        - Results are sorted by vote average with minimum vote threshold
        - Provides a curated list of critically acclaimed films
        - Supports additional filtering through query parameters
    """
    params = {
        "page": str(page),
        "sort_by": "vote_average.desc",
        "vote_count.gte": "10000",  # Minimum votes for reliability
        "vote_average.gte": "7.0",  # Minimum rating threshold
        "include_adult": "false",
        "with_original_language": "en"
    }

    # Parse and add optional filters
    if year_range:
        year_tuple = parse_range_param(year_range)
        if year_tuple:
            params["primary_release_date.gte"] = f"{int(year_tuple[0])}-01-01"
            params["primary_release_date.lte"] = f"{int(year_tuple[1])}-12-31"
    
    if rating_range:
        rating_tuple = parse_range_param(rating_range)
        if rating_tuple:
            params["vote_average.gte"] = str(rating_tuple[0])
            params["vote_average.lte"] = str(rating_tuple[1])
    
    if popularity_range:
        popularity_tuple = parse_range_param(popularity_range)
        if popularity_tuple:
            params["vote_count.gte"] = str(int(popularity_tuple[0]))
            params["vote_count.lte"] = str(int(popularity_tuple[1]))

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                get_tmdb_url("discover/movie"),
                params=params,
                headers=HEADERS
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            logger.error(f"TMDB API error in get_top_rated_movies: {str(e)}")
            raise HTTPException(status_code=500, detail=f"TMDB API error: {str(e)}")

@router.get("/upcoming")
async def get_upcoming_movies(
    page: int = 1,
    year_range: Optional[str] = None,
    rating_range: Optional[str] = None,
    popularity_range: Optional[str] = None
):
    """
    Retrieve a list of upcoming movie releases using TMDB's discover API.
    
    Args:
        page: Page number for pagination (default: 1)
        year_range: Optional tuple of (start_year, end_year)
        rating_range: Optional tuple of (min_rating, max_rating)
        popularity_range: Optional tuple of (min_votes, max_votes)
    
    Returns:
        dict: JSON response containing:
            - page: Current page number
            - results: List of movie objects with basic information
            - total_pages: Total number of available pages
            - total_results: Total number of movies
    
    Notes:
        - Results are sorted by release date
        - Only includes movies with future release dates
        - Supports additional filtering through query parameters
    """
    today = datetime.now().strftime("%Y-%m-%d")
    three_months_future = (datetime.now() + timedelta(days=90)).strftime("%Y-%m-%d")

    params = {
        "page": str(page),
        "sort_by": "popularity.desc",
        "primary_release_date.gte": today,
        "primary_release_date.lte": three_months_future,
        "include_adult": "false",
        "with_release_type": "2|3",  # Theatrical and digital releases
        "with_original_language": "en"
    }

    # Parse and add optional filters
    if year_range:
        year_tuple = parse_range_param(year_range)
        if year_tuple:
            # For upcoming movies, we only use the end_year as we already have a start date
            params["primary_release_date.lte"] = f"{int(year_tuple[1])}-12-31"
    
    if rating_range:
        rating_tuple = parse_range_param(rating_range)
        if rating_tuple:
            params["vote_average.gte"] = str(rating_tuple[0])
            params["vote_average.lte"] = str(rating_tuple[1])
    
    if popularity_range:
        popularity_tuple = parse_range_param(popularity_range)
        if popularity_tuple:
            params["vote_count.gte"] = str(int(popularity_tuple[0]))
            params["vote_count.lte"] = str(int(popularity_tuple[1]))

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                get_tmdb_url("discover/movie"),
                params=params,
                headers=HEADERS
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            logger.error(f"TMDB API error in get_upcoming_movies: {str(e)}")
            raise HTTPException(status_code=500, detail=f"TMDB API error: {str(e)}")

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
    """
    return await scrape_movie_news()

@router.get("/hidden-gems")
async def get_hidden_gems(
    page: int = 1,
    year_range: Optional[str] = None,
    rating_range: Optional[str] = None,
    popularity_range: Optional[str] = None
):
    """
    Retrieve a curated list of hidden gem movies.
    
    These are high-quality movies (rating >= 7.5) that aren't blockbusters,
    released in the last 20 years.
    
    Args:
        page: Page number for pagination (default: 1)
        year_range: Optional tuple of (start_year, end_year)
        rating_range: Optional tuple of (min_rating, max_rating)
        popularity_range: Optional tuple of (min_votes, max_votes)
    
    Returns:
        dict: JSON response containing:
            - page: Current page number
            - results: List of movie objects with basic information
            - total_pages: Total number of available pages
            - total_results: Total number of movies
    """
    from datetime import datetime, timedelta
    twenty_years_ago = (datetime.now() - timedelta(days=20*365)).strftime("%Y-%m-%d")
    
    params = {
        "page": str(page),
        "sort_by": "vote_average.desc",
        "vote_average.gte": 7.5,
        "vote_count.gte": 5000,
        "vote_count.lte": 20000,
        "primary_release_date.gte": twenty_years_ago,
        "language": "en-US",
        "include_adult": "false",
        "with_release_type": "3|2",
        "with_original_language": "en"
    }

    # Parse and add optional filters
    if year_range:
        year_tuple = parse_range_param(year_range)
        if year_tuple:
            params["primary_release_date.gte"] = f"{int(year_tuple[0])}-01-01"
            params["primary_release_date.lte"] = f"{int(year_tuple[1])}-12-31"
    
    if rating_range:
        rating_tuple = parse_range_param(rating_range)
        if rating_tuple:
            params["vote_average.gte"] = str(rating_tuple[0])
            params["vote_average.lte"] = str(rating_tuple[1])
    
    if popularity_range:
        popularity_tuple = parse_range_param(popularity_range)
        if popularity_tuple:
            params["vote_count.gte"] = str(int(popularity_tuple[0]))
            params["vote_count.lte"] = str(int(popularity_tuple[1]))
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                get_tmdb_url("discover/movie"),
                params=params,
                headers=HEADERS
            )
            
            response.raise_for_status()
            return response.json()
            
        except httpx.HTTPError as e:
            logger.error(f"TMDB API error in get_hidden_gems: {str(e)}")
            raise HTTPException(status_code=500, detail=f"TMDB API error: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error in get_hidden_gems: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")

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
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            get_tmdb_url("search/movie"),
            params={"query": query, "include_adult": "false"},
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

@router.get("/{movie_id}/watch-providers")
async def get_movie_watch_providers(movie_id: int, region: str = "US"):
    """
    Retrieve streaming availability information for a specific movie.
    
    Args:
        movie_id: TMDB ID of the movie
        region: ISO 3166-1 country code (default: "US")
    
    Returns:
        dict: Watch provider information including:
            - Streaming platforms
            - Rental options
            - Purchase options
            - Free options (if available)
            - Links to watch
    
    Notes:
        - Results are region-specific
        - Includes provider logos and direct links
        - Data is provided by JustWatch through TMDB
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            get_tmdb_url(f"movie/{movie_id}/watch/providers"),
            headers=HEADERS
        )
        data = response.json()
        
        # Extract region-specific data if available
        if "results" in data and region in data["results"]:
            return data["results"][region]
        return {"error": "No watch provider data available for this region"} 