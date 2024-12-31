from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, DateTime, ForeignKey
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
    year_range: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    rating_range: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    popularity_range: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    genres: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="filter_settings", lazy="selectin") 