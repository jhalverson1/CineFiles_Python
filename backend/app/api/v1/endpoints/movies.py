from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from app.core.tmdb import tmdb_client
from app.schemas.movie import MovieResponse, MovieList
from app.core.config import settings
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

# Fixed routes first (no path parameters)
@router.get("/filtered", response_model=MovieList)
async def get_filtered_movies(
    page: int = Query(1, ge=1),
    start_year: Optional[int] = Query(None, ge=1900, le=2100),
    end_year: Optional[int] = Query(None, ge=1900, le=2100),
    min_rating: Optional[float] = Query(None, ge=0, le=10),
    max_rating: Optional[float] = Query(None, ge=0, le=10),
    min_popularity: Optional[float] = Query(None, ge=0),
    max_popularity: Optional[float] = Query(None),
    genres: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
) -> MovieList:
    """
    Get a filtered list of movies based on various criteria.
    """
    try:
        # Build discover parameters
        params = {
            "page": page,
            "sort_by": "popularity.desc",  # Default sort
            "include_adult": False,
            "include_video": False,
            "language": "en-US",
        }

        # Add year range filter
        if start_year and end_year:
            if start_year > end_year:
                start_year, end_year = end_year, start_year
            params["primary_release_date.gte"] = f"{start_year}-01-01"
            params["primary_release_date.lte"] = f"{end_year}-12-31"

        # Add rating range filter
        if min_rating is not None:
            params["vote_average.gte"] = min_rating
        if max_rating is not None:
            params["vote_average.lte"] = max_rating

        # Add popularity range filter
        if min_popularity is not None:
            params["vote_count.gte"] = min_popularity
        if max_popularity is not None:
            params["vote_count.lte"] = max_popularity

        # Add genres filter
        if genres:
            genre_list = genres.split(',')
            if genre_list:
                params["with_genres"] = ','.join(genre_list)

        # Make API call to TMDB
        response = await tmdb_client.get("/discover/movie", params=params)
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"TMDB API error: {response.json().get('status_message', 'Unknown error')}"
            )

        data = response.json()
        
        # Transform the response to match our MovieList schema
        return MovieList(
            page=data.get("page", 1),
            results=[MovieResponse(**movie) for movie in data.get("results", [])],
            total_pages=data.get("total_pages", 1),
            total_results=data.get("total_results", 0)
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching filtered movies: {str(e)}"
        )

@router.get("/genres")
async def get_movie_genres():
    """Get all movie genres"""
    response = await tmdb_client.get("/genre/movie/list")
    return response.json()

@router.get("/search")
async def search_movies(query: str):
    """Search for movies"""
    response = await tmdb_client.get("/search/movie", params={"query": query})
    return response.json()

# Parameterized routes last
@router.get("/{movie_id}")
async def get_movie_details(movie_id: int):
    """Get details for a specific movie"""
    response = await tmdb_client.get(f"/movie/{movie_id}")
    return response.json()

@router.get("/{movie_id}/credits")
async def get_movie_credits(movie_id: int):
    """Get credits for a specific movie"""
    response = await tmdb_client.get(f"/movie/{movie_id}/credits")
    return response.json()

@router.get("/{movie_id}/videos")
async def get_movie_videos(movie_id: int):
    """Get videos for a specific movie"""
    response = await tmdb_client.get(f"/movie/{movie_id}/videos")
    return response.json()

@router.get("/{movie_id}/watch-providers")
async def get_movie_watch_providers(movie_id: int):
    """Get watch providers for a specific movie"""
    response = await tmdb_client.get(f"/movie/{movie_id}/watch/providers")
    return response.json() 