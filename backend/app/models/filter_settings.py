from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.database.database import Base

class FilterSettings(Base):
    """
    FilterSettings model for storing user's filter preferences.
    """
    __tablename__ = "filter_settings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    search_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    year_range: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    rating_range: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    popularity_range: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    genres: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now()) 