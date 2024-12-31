from typing import Optional
from pydantic import BaseModel
from datetime import datetime


class FilterSettingsBase(BaseModel):
    """Base schema for filter settings."""
    name: str
    search_text: Optional[str] = None
    year_range: Optional[str] = None
    rating_range: Optional[str] = None
    popularity_range: Optional[str] = None
    genres: Optional[str] = None


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