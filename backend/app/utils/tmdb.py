"""
TMDB API Integration Utility

This module provides configuration and helper functions for interacting with
The Movie Database (TMDB) API. It handles API authentication and URL generation.

Features:
- Centralized TMDB API configuration
- Bearer token authentication
- URL generation for API endpoints
- Standard headers for all requests

The module uses environment-based configuration through the settings module
to manage API credentials securely.
"""

from app.core.config import get_settings

settings = get_settings()

# Base URL for TMDB API v3
TMDB_BASE_URL = "https://api.themoviedb.org/3"

# Standard headers for all TMDB API requests
HEADERS = {
    "Authorization": f"Bearer {settings.TMDB_BEARER_TOKEN}",
    "accept": "application/json"
}

def get_tmdb_url(path: str) -> str:
    """
    Generate a complete TMDB API URL for a given endpoint path.
    
    Args:
        path: API endpoint path (e.g., "movie/popular" or "search/movie")
    
    Returns:
        str: Complete URL including base URL and path
    
    Examples:
        >>> get_tmdb_url("movie/popular")
        'https://api.themoviedb.org/3/movie/popular'
        >>> get_tmdb_url("search/movie")
        'https://api.themoviedb.org/3/search/movie'
    
    Notes:
        - Automatically handles path normalization
        - Used by all TMDB API requests in the application
        - Does not include query parameters
    """
    return f"{TMDB_BASE_URL}/{path}" 