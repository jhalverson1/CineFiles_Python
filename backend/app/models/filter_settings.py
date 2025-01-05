from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, DateTime, ForeignKey, Boolean, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID

from app.database.database import Base

class FilterSettings(Base):
    """
    FilterSettings model for storing user's filter preferences.
    """
    __tablename__ = "filter_settings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(String(100))
    search_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Year range
    release_date_gte: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    release_date_lte: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Rating range
    rating_gte: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    rating_lte: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    # Popularity range
    popularity_gte: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    popularity_lte: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    # Vote count range
    vote_count_gte: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vote_count_lte: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Runtime range (in minutes)
    runtime_gte: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    runtime_lte: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Genre, language, and other filters
    genres: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Comma-separated genre IDs
    original_language: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)  # e.g., 'en', 'es'
    spoken_languages: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Comma-separated language codes
    
    # Release type (1: Premiere, 2: Limited, 3: Theatrical, 4: Digital, 5: Physical, 6: TV)
    release_types: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Comma-separated numbers
    
    # Watch providers and region
    watch_providers: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Comma-separated provider IDs
    watch_region: Mapped[Optional[str]] = mapped_column(String(2), nullable=True)  # ISO 3166-1 country code
    watch_monetization_types: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Comma-separated types (free, ads, rent, buy)
    
    # Company and country filters
    companies: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Comma-separated company IDs
    origin_countries: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Comma-separated ISO 3166-1 codes
    
    # Cast and crew filters
    cast: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Comma-separated person IDs
    crew: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Comma-separated person IDs
    
    # Keywords
    include_keywords: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Comma-separated keyword IDs
    exclude_keywords: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Comma-separated keyword IDs
    
    # Sort options
    sort_by: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # e.g., 'popularity.desc'
    
    # Display settings
    is_homepage_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    homepage_display_order: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="filter_settings", lazy="selectin") 