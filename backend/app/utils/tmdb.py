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
    "accept": "application/json",
    "Authorization": f"Bearer {settings.TMDB_BEARER_TOKEN}"
}

def get_tmdb_url(endpoint: str) -> str:
    """
    Construct a TMDB API URL for the given endpoint.
    
    Args:
        endpoint: API endpoint path (e.g., "movie/popular")
        
    Returns:
        str: Complete TMDB API URL
    """
    return f"{TMDB_BASE_URL}/{endpoint.lstrip('/')}" 