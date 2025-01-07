from typing import Optional
from pydantic import BaseModel
from datetime import datetime


class FilterSettingsBase(BaseModel):
    """Base schema for filter settings."""
    name: str
    search_text: Optional[str] = None
    genres: Optional[str] = None
    is_homepage_enabled: bool = False
    homepage_display_order: Optional[int] = None
    
    # Date range
    release_date_gte: Optional[datetime] = None
    release_date_lte: Optional[datetime] = None
    
    # Rating range
    rating_gte: Optional[float] = None
    rating_lte: Optional[float] = None
    
    # Popularity range
    popularity_gte: Optional[float] = None
    popularity_lte: Optional[float] = None
    
    # Vote count range
    vote_count_gte: Optional[int] = None
    vote_count_lte: Optional[int] = None
    
    # Runtime range
    runtime_gte: Optional[int] = None
    runtime_lte: Optional[int] = None
    
    # Language filters
    original_language: Optional[str] = None
    spoken_languages: Optional[str] = None
    
    # Release types
    release_types: Optional[str] = None
    
    # Watch providers
    watch_providers: Optional[str] = None
    watch_region: Optional[str] = None
    watch_monetization_types: Optional[str] = None
    
    # Companies and countries
    companies: Optional[str] = None
    origin_countries: Optional[str] = None
    
    # Cast and crew
    cast: Optional[str] = None
    crew: Optional[str] = None
    
    # Keywords
    include_keywords: Optional[str] = None
    exclude_keywords: Optional[str] = None
    
    # Sorting
    sort_by: Optional[str] = None


class FilterSettingsCreate(FilterSettingsBase):
    """Schema for creating filter settings."""
    pass


class FilterSettingsUpdate(FilterSettingsBase):
    """Schema for updating filter settings."""
    pass


class FilterSettings(FilterSettingsBase):
    """Schema for filter settings response."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 