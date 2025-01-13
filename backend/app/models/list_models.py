"""
List Models

This module defines the SQLAlchemy models for movie lists and list items.
It provides the data structure for user-created movie collections and watchlists.

The module includes two main models:
- List: Represents a collection of movies (e.g., "Watchlist", "Favorites")
- ListItem: Represents a movie entry within a list

Features:
- UUID-based primary keys for security
- Automatic timestamp management
- Lazy loading of relationships
- Unique constraints to prevent duplicates
- Support for default system lists
"""

from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy import Column, ForeignKey, String, Boolean, DateTime, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import relationship
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import func
from typing import Optional, List as PyList

from ..database.database import Base

class List(Base):
    """
    SQLAlchemy model representing a movie list.
    
    A list is a collection of movies created by a user. It can be either
    a system-generated default list (like "Watched") or a custom user list.
    
    Attributes:
        id (UUID): Primary key, automatically generated UUID4
        user_id (UUID): Foreign key to the owner's user record
        name (str): Name of the list (max 100 chars)
        description (str, optional): Optional description of the list
        is_default (bool): Whether this is a system-generated default list
        created_at (datetime): Timestamp of list creation
        updated_at (datetime): Timestamp of last list update
        items (relationship): One-to-many relationship with ListItem model
        user (relationship): Many-to-one relationship with User model
    
    Notes:
        - Each user can have multiple lists
        - Lists are automatically deleted when the user is deleted
        - Default lists are created automatically for new users
        - List items are loaded eagerly by default
    """
    __tablename__ = "lists"

    id: Mapped[UUID] = mapped_column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(PostgresUUID(as_uuid=True), ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Use string reference to avoid circular import
    items: Mapped[PyList["ListItem"]] = relationship("ListItem", back_populates="list", lazy="selectin", cascade="all, delete-orphan")
    user: Mapped["User"] = relationship("User", back_populates="lists", lazy="selectin")

class ListItem(Base):
    """
    SQLAlchemy model representing a movie entry in a list.
    
    Each ListItem represents a single movie within a user's list,
    along with any notes or metadata specific to that entry.
    
    Attributes:
        id (UUID): Primary key, automatically generated UUID4
        list_id (UUID): Foreign key to the parent list
        movie_id (str): TMDB ID of the movie
        added_at (datetime): Timestamp when movie was added to list
        notes (str, optional): Optional user notes about the movie
        list (relationship): Many-to-one relationship with List model
    
    Notes:
        - A movie can only appear once in a given list (enforced by constraint)
        - The same movie can appear in different lists
        - Movie IDs are stored as strings to match TMDB's format
        - Items are automatically deleted when their parent list is deleted
    """
    __tablename__ = "list_items"

    id: Mapped[UUID] = mapped_column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    list_id: Mapped[UUID] = mapped_column(PostgresUUID(as_uuid=True), ForeignKey("lists.id", ondelete="CASCADE"))
    movie_id: Mapped[str] = mapped_column(String)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    added_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    list: Mapped["List"] = relationship("List", back_populates="items", lazy="selectin")

    __table_args__ = (
        UniqueConstraint('list_id', 'movie_id', name='uix_list_movie'),
    ) 