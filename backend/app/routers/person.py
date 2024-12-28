"""
Person Router

This module handles endpoints related to person (cast and crew) information from TMDB.
It provides detailed information about actors, directors, and other film industry professionals.

Features:
- Detailed person information retrieval
- Biographical data
- Filmography details
- Personal information (birthday, place of birth, etc.)
- Profile images and media

All person data is sourced directly from TMDB's comprehensive database.
"""

from fastapi import APIRouter, HTTPException
import httpx
from app.utils.tmdb import get_tmdb_url, HEADERS

router = APIRouter()

@router.get("/{person_id}")
async def get_person_details(person_id: int):
    """
    Retrieve detailed information about a specific person.
    
    Args:
        person_id: TMDB ID of the person
    
    Returns:
        dict: Comprehensive person details including:
            - name: Full name
            - biography: Detailed biography
            - birthday: Date of birth
            - deathday: Date of death (if applicable)
            - place_of_birth: Birth location
            - profile_path: URL to profile image
            - known_for_department: Primary profession
            - also_known_as: Alternative names
            - popularity: Popularity rating
            - adult: Adult actor flag
            - homepage: Personal website URL
    
    Notes:
        - Provides complete biographical and professional information
        - Includes both basic details and extended information
        - Image URLs require TMDB base URL prefix
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            get_tmdb_url(f"person/{person_id}"),
            headers=HEADERS
        )
        return response.json() 