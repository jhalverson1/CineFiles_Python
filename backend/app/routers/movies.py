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

from fastapi import APIRouter, HTTPException, Request, Query, Depends
from typing import Optional, Tuple
import httpx
from app.utils.tmdb import get_tmdb_url, HEADERS
from app.utils.scraper import scrape_movie_news
import logging
from datetime import datetime, timedelta
import json
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.database import get_db
from app.models.filter_settings import FilterSettings
from sqlalchemy import select

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/genres")
async def get_movie_genres():
    """
    Retrieve list of available movie genres from TMDB.
    """
    async with httpx.AsyncClient() as client:
        try:
            url = get_tmdb_url("genre/movie/list")
            params = {"language": "en-US"}
            logger.info(f"Fetching genres from TMDB: {url} with params {params}")
            
            response = await client.get(
                url,
                params=params,
                headers=HEADERS
            )
            
            if not response.is_success:
                logger.error(f"TMDB API error response: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"TMDB API error: {response.text}"
                )
                
            data = response.json()
            logger.info(f"Successfully fetched {len(data.get('genres', []))} genres from TMDB")
            return data
            
        except httpx.HTTPError as e:
            logger.error(f"TMDB API error in get_movie_genres: {str(e)}")
            raise HTTPException(status_code=500, detail=f"TMDB API error: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error in get_movie_genres: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")

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
async def get_popular_movies(
    page: int = Query(1, ge=1),
    start_year: Optional[int] = None,
    end_year: Optional[int] = None,
    min_rating: Optional[float] = None,
    max_rating: Optional[float] = None,
    min_popularity: Optional[float] = None,
    max_popularity: Optional[float] = None,
    genres: Optional[str] = None,
    include_keywords: Optional[str] = None,
    exclude_keywords: Optional[str] = None
):
    """Get popular movies with optional filters."""
    params = {
        "page": str(page),
        "sort_by": "popularity.desc",
        "include_adult": "false",
        "include_video": "false",
        "language": "en-US",
        "with_original_language": "en",
        "vote_count.gte": "100"  # Ensure some minimum votes
    }
    
    add_filter_params(
        params, 
        start_year, 
        end_year, 
        min_rating, 
        max_rating, 
        min_popularity, 
        max_popularity, 
        genres,
        include_keywords,
        exclude_keywords
    )
    
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
            logger.error(f"TMDB API error in get_popular_movies: {str(e)}")
            raise HTTPException(status_code=500, detail=f"TMDB API error: {str(e)}")

@router.get("/top_rated")
async def get_top_rated_movies(
    page: int = Query(1, ge=1),
    start_year: Optional[int] = None,
    end_year: Optional[int] = None,
    min_rating: Optional[float] = None,
    max_rating: Optional[float] = None,
    min_popularity: Optional[float] = None,
    max_popularity: Optional[float] = None,
    genres: Optional[str] = None,
    include_keywords: Optional[str] = None,
    exclude_keywords: Optional[str] = None
):
    """Get top rated movies with optional filters."""
    params = {
        "page": str(page),
        "sort_by": "vote_average.desc",
        "include_adult": "false",
        "include_video": "false",
        "language": "en-US",
        "with_original_language": "en",
        "vote_count.gte": "1000"  # Ensure significant number of votes
    }
    
    add_filter_params(
        params, 
        start_year, 
        end_year, 
        min_rating, 
        max_rating, 
        min_popularity, 
        max_popularity, 
        genres,
        include_keywords,
        exclude_keywords
    )
    
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
    page: int = Query(1, ge=1),
    start_year: Optional[int] = None,
    end_year: Optional[int] = None,
    min_rating: Optional[float] = None,
    max_rating: Optional[float] = None,
    min_popularity: Optional[float] = None,
    max_popularity: Optional[float] = None,
    genres: Optional[str] = None,
    include_keywords: Optional[str] = None,
    exclude_keywords: Optional[str] = None
):
    """Get upcoming movies with optional filters."""
    today = datetime.now().date()
    future_date = today + timedelta(days=90)
    
    params = {
        "page": str(page),
        "sort_by": "popularity.desc",
        "include_adult": "false",
        "include_video": "false",
        "language": "en-US",
        "with_original_language": "en",
        "primary_release_date.gte": today.isoformat(),
        "primary_release_date.lte": future_date.isoformat()
    }
    
    add_filter_params(
        params, 
        start_year, 
        end_year, 
        min_rating, 
        max_rating, 
        min_popularity, 
        max_popularity, 
        genres,
        include_keywords,
        exclude_keywords
    )
    
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

@router.get("/now_playing")
async def get_now_playing_movies(
    page: int = Query(1, ge=1),
    start_year: Optional[int] = None,
    end_year: Optional[int] = None,
    min_rating: Optional[float] = None,
    max_rating: Optional[float] = None,
    min_popularity: Optional[float] = None,
    max_popularity: Optional[float] = None,
    genres: Optional[str] = None,
    include_keywords: Optional[str] = None,
    exclude_keywords: Optional[str] = None
):
    """Get now playing movies with optional filters."""
    today = datetime.now().date()
    past_date = today - timedelta(days=30)
    
    params = {
        "page": str(page),
        "sort_by": "popularity.desc",
        "include_adult": "false",
        "include_video": "false",
        "language": "en-US",
        "with_original_language": "en",
        "primary_release_date.gte": past_date.isoformat(),
        "primary_release_date.lte": today.isoformat()
    }
    
    add_filter_params(
        params, 
        start_year, 
        end_year, 
        min_rating, 
        max_rating, 
        min_popularity, 
        max_popularity, 
        genres,
        include_keywords,
        exclude_keywords
    )
    
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
            logger.error(f"TMDB API error in get_now_playing_movies: {str(e)}")
            raise HTTPException(status_code=500, detail=f"TMDB API error: {str(e)}")

def add_filter_params(
    params, 
    start_year, 
    end_year, 
    min_rating, 
    max_rating, 
    min_popularity, 
    max_popularity, 
    genres,
    include_keywords=None,
    exclude_keywords=None
):
    """Helper function to add common filter parameters."""
    # Add year range filter (only if explicitly provided)
    if start_year is not None or end_year is not None:
        if start_year is not None:
            params["primary_release_date.gte"] = f"{start_year}-01-01"
        if end_year is not None:
            params["primary_release_date.lte"] = f"{end_year}-12-31"

    # Add rating range filter
    if min_rating is not None:
        params["vote_average.gte"] = str(min_rating)
    if max_rating is not None:
        params["vote_average.lte"] = str(max_rating)

    # Add popularity range filter
    if min_popularity is not None:
        params["popularity.gte"] = str(min_popularity)
    if max_popularity is not None:
        params["popularity.lte"] = str(max_popularity)

    # Add genres filter
    if genres:
        params["with_genres"] = genres.replace(",", "|")

    # Add keywords filters
    if include_keywords:
        params["with_keywords"] = include_keywords.replace(",", "|")
    if exclude_keywords:
        params["without_keywords"] = exclude_keywords.replace(",", "|")

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
    popularity_range: Optional[str] = None,
    genres: Optional[str] = None,
    include_keywords: Optional[str] = None,
    exclude_keywords: Optional[str] = None
):
    """
    Retrieve a curated list of hidden gem movies.
    
    Args:
        page: Page number for pagination (default: 1)
        year_range: Optional tuple of (start_year, end_year)
        rating_range: Optional tuple of (min_rating, max_rating)
        popularity_range: Optional tuple of (min_votes, max_votes)
        genres: Comma-separated list of genre IDs
        include_keywords: Comma-separated list of keywords to include
        exclude_keywords: Comma-separated list of keywords to exclude
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

    if genres:
        params["with_genres"] = genres.replace(",", "|")

    # Add keywords filters
    if include_keywords:
        params["with_keywords"] = include_keywords.replace(",", "|")
    if exclude_keywords:
        params["without_keywords"] = exclude_keywords.replace(",", "|")
    
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

@router.get("/filtered")
async def get_filtered_movies(
    page: int = Query(1, ge=1),
    start_year: Optional[int] = None,
    end_year: Optional[int] = None,
    min_rating: Optional[float] = None,
    max_rating: Optional[float] = None,
    min_popularity: Optional[float] = None,
    max_popularity: Optional[float] = None,
    genres: Optional[str] = None,
    sort_by: Optional[str] = None,
    min_vote_count: Optional[int] = None,
    max_vote_count: Optional[int] = None,
    min_runtime: Optional[int] = None,
    max_runtime: Optional[int] = None,
    release_date_gte: Optional[str] = None,
    release_date_lte: Optional[str] = None,
    watch_providers: Optional[str] = None,
    watch_region: str = "US",
    include_keywords: Optional[str] = None,
    exclude_keywords: Optional[str] = None,
    release_types: Optional[str] = None
):
    """
    Get a filtered list of movies based on various criteria.
    """
    params = {
        "page": str(page),
        "sort_by": sort_by or "popularity.desc",
        "include_adult": "false",
        "include_video": "false",
        "language": "en-US",
        "with_original_language": "en",
    }

    # Add vote count filter
    if min_vote_count is not None:
        params["vote_count.gte"] = str(min_vote_count)
    if max_vote_count is not None:
        params["vote_count.lte"] = str(max_vote_count)
    if min_vote_count is None and max_vote_count is None:
        params["vote_count.gte"] = "100"  # Default minimum vote count

    # Add runtime filter
    if min_runtime is not None:
        params["with_runtime.gte"] = str(min_runtime)
    if max_runtime is not None:
        params["with_runtime.lte"] = str(max_runtime)

    # Add year range filter
    if start_year is not None or end_year is not None:
        if start_year is not None and end_year is not None and start_year > end_year:
            start_year, end_year = end_year, start_year
        if start_year is not None:
            params["primary_release_date.gte"] = f"{start_year}-01-01"
        if end_year is not None:
            params["primary_release_date.lte"] = f"{end_year}-12-31"
    # Handle specific release date filters
    elif release_date_gte or release_date_lte:
        if release_date_gte:
            params["primary_release_date.gte"] = release_date_gte
        if release_date_lte:
            params["primary_release_date.lte"] = release_date_lte

    # Add common filter parameters
    add_filter_params(
        params,
        None,  # start_year (already handled above)
        None,  # end_year (already handled above)
        min_rating,
        max_rating,
        min_popularity,
        max_popularity,
        genres,
        include_keywords,
        exclude_keywords
    )

    # Add watch providers filter
    if watch_providers:
        params["with_watch_providers"] = watch_providers.replace(",", "|")
        params["watch_region"] = watch_region

    # Add keywords filters
    if include_keywords:
        params["with_keywords"] = include_keywords.replace(",", "|")
    if exclude_keywords:
        params["without_keywords"] = exclude_keywords.replace(",", "|")

    # Add release types filter
    if release_types:
        params["with_release_type"] = release_types.replace(",", "|")

    logger.info(f"Filtered movies params: {params}")

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
            logger.error(f"TMDB API error in get_filtered_movies: {str(e)}")
            raise HTTPException(status_code=500, detail=f"TMDB API error: {str(e)}")

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

@router.get("/filter-settings/{filter_id}/movies")
async def get_filter_setting_movies(
    filter_id: int,
    page: int = Query(1, ge=1),
    start_year: Optional[int] = None,
    end_year: Optional[int] = None,
    min_rating: Optional[float] = None,
    max_rating: Optional[float] = None,
    min_popularity: Optional[float] = None,
    max_popularity: Optional[float] = None,
    genres: Optional[str] = None,
    watch_providers: Optional[str] = None,
    watch_region: Optional[str] = None,
    include_keywords: Optional[str] = None,
    exclude_keywords: Optional[str] = None,
    min_vote_count: Optional[int] = None,
    max_vote_count: Optional[int] = None,
    min_runtime: Optional[int] = None,
    max_runtime: Optional[int] = None,
    release_types: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get movies based on a saved filter setting."""
    logger.info("=" * 80)
    logger.info("Entering get_filter_setting_movies endpoint")
    logger.info(f"Request path: /filter-settings/{filter_id}/movies")
    logger.info(f"Request parameters: {locals()}")
    
    try:
        # Log database connection status
        logger.info(f"Database session: {db}")
        logger.info(f"Database session state: {db.is_active}")

        # Get the filter setting from the database
        query = select(FilterSettings).where(FilterSettings.id == filter_id)
        logger.info(f"Executing database query: {query}")
        logger.info(f"SQL Query: {query.compile(compile_kwargs={'literal_binds': True})}")
        
        try:
            result = await db.execute(query)
            filter_setting = result.scalar_one_or_none()
            
            if not filter_setting:
                logger.error(f"Filter setting not found for ID: {filter_id}")
                logger.info("Available columns in FilterSettings:")
                for column in FilterSettings.__table__.columns:
                    logger.info(f"  - {column.name}: {column.type}")
                raise HTTPException(status_code=404, detail="Filter setting not found")

            logger.info(f"Found filter setting: {filter_setting.__dict__}")
            
            # Combine saved filter settings with any additional filters passed in the request
            params = {
                "page": str(page),
                "sort_by": "popularity.desc",  # Default sort
                "include_adult": "false",
                "include_video": "false",
                "language": "en-US",
                "with_original_language": "en",
            }
            
            try:
                # Handle release date range
                if filter_setting.release_date_gte:
                    params["primary_release_date.gte"] = filter_setting.release_date_gte.strftime("%Y-%m-%d")
                if filter_setting.release_date_lte:
                    params["primary_release_date.lte"] = filter_setting.release_date_lte.strftime("%Y-%m-%d")

                # Handle rating range
                if filter_setting.rating_gte is not None:
                    params["vote_average.gte"] = str(filter_setting.rating_gte)
                if filter_setting.rating_lte is not None:
                    params["vote_average.lte"] = str(filter_setting.rating_lte)
                
                # Handle popularity range
                if filter_setting.popularity_gte is not None:
                    params["popularity.gte"] = str(filter_setting.popularity_gte)
                if filter_setting.popularity_lte is not None:
                    params["popularity.lte"] = str(filter_setting.popularity_lte)

                # Handle genres
                if filter_setting.genres:
                    params["with_genres"] = filter_setting.genres

                # Handle watch providers
                if filter_setting.watch_providers:
                    params["with_watch_providers"] = filter_setting.watch_providers

                # Handle watch region
                if filter_setting.watch_region:
                    params["watch_region"] = filter_setting.watch_region
                else:
                    params["watch_region"] = "US"  # Default to US if not specified

                # Handle keywords
                if filter_setting.include_keywords:
                    params["with_keywords"] = filter_setting.include_keywords
                if filter_setting.exclude_keywords:
                    params["without_keywords"] = filter_setting.exclude_keywords

                # Handle vote count range
                if filter_setting.vote_count_gte is not None:
                    params["vote_count.gte"] = str(filter_setting.vote_count_gte)
                if filter_setting.vote_count_lte is not None:
                    params["vote_count.lte"] = str(filter_setting.vote_count_lte)

                # Handle runtime range
                if filter_setting.runtime_gte is not None:
                    params["with_runtime.gte"] = str(filter_setting.runtime_gte)
                if filter_setting.runtime_lte is not None:
                    params["with_runtime.lte"] = str(filter_setting.runtime_lte)

                # Handle release types
                if filter_setting.release_types:
                    params["with_release_type"] = filter_setting.release_types

                # Handle sort by
                if filter_setting.sort_by:
                    params["sort_by"] = filter_setting.sort_by

            except Exception as e:
                logger.error(f"Error processing filter settings: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error processing filter settings: {str(e)}")
            
            # Override with request parameters if provided
            if min_vote_count is not None:
                params["vote_count.gte"] = str(min_vote_count)
            if max_vote_count is not None:
                params["vote_count.lte"] = str(max_vote_count)

            if min_runtime is not None:
                params["with_runtime.gte"] = str(min_runtime)
            if max_runtime is not None:
                params["with_runtime.lte"] = str(max_runtime)

            if release_types:
                params["with_release_type"] = release_types.replace(",", "|")

            # Add basic filters
            if start_year and end_year:
                if start_year > end_year:
                    start_year, end_year = end_year, start_year
                params["primary_release_date.gte"] = f"{start_year}-01-01"
                params["primary_release_date.lte"] = f"{end_year}-12-31"

            if min_rating is not None:
                params["vote_average.gte"] = str(min_rating)
            if max_rating is not None:
                params["vote_average.lte"] = str(max_rating)

            if min_popularity is not None:
                params["popularity.gte"] = str(min_popularity)
            if max_popularity is not None:
                params["popularity.lte"] = str(max_popularity)

            if genres:
                params["with_genres"] = genres.replace(",", "|")
            
            # Override watch providers if provided in request
            if watch_providers:
                params["with_watch_providers"] = watch_providers.replace(",", "|")
            if watch_region:
                params["watch_region"] = watch_region

            # Override keywords if provided in request
            if include_keywords:
                params["with_keywords"] = include_keywords.replace(",", "|")
            if exclude_keywords:
                params["without_keywords"] = exclude_keywords.replace(",", "|")
            
            logger.info(f"Final TMDB API parameters: {params}")
            
            async with httpx.AsyncClient() as client:
                try:
                    tmdb_url = get_tmdb_url("discover/movie")
                    logger.info(f"Making TMDB API request to: {tmdb_url}")
                    response = await client.get(
                        tmdb_url,
                        params=params,
                        headers=HEADERS
                    )
                    response.raise_for_status()
                    data = response.json()
                    logger.info(f"TMDB API response received. Total results: {data.get('total_results', 0)}")
                    return data
                except httpx.HTTPError as e:
                    logger.error(f"TMDB API error: {str(e)}")
                    raise HTTPException(status_code=500, detail=f"TMDB API error: {str(e)}")
        except Exception as e:
            logger.error(f"Error executing database query: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    finally:
        logger.info("=" * 80) 