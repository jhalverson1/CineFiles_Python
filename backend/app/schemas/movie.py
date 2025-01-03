"""
Movie Schema Module

This module defines Pydantic models for movie-related data structures.
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class MovieBase(BaseModel):
    """Base movie schema with common attributes."""
    tmdb_id: str
    title: str
    overview: Optional[str] = None
    release_date: Optional[date] = None
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    vote_average: Optional[float] = None
    vote_count: Optional[int] = None
    popularity: Optional[float] = None
    genres: Optional[List[str]] = None

class MovieCreate(MovieBase):
    """Schema for creating a new movie."""
    pass

class MovieResponse(MovieBase):
    """Schema for movie responses."""
    class Config:
        from_attributes = True 