"""
User Model

This module defines the User SQLAlchemy model for the application's user management system.
It handles user authentication, authorization, and relationships with other models.

The User model includes:
- Basic user information (email, optional username)
- Authentication fields (hashed password)
- Status flags (active)
- Timestamps (creation, updates, last login)
"""

from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy import String, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List as PyList

from ..database.database import Base

class User(Base):
    """
    SQLAlchemy model representing a user in the system.
    
    Attributes:
        id (UUID): Primary key, auto-generated UUID
        email (str): Unique email address, indexed
        username (str): Username for the user
        hashed_password (str): Bcrypt-hashed password
        is_active (bool): Whether the user account is active
        created_at (datetime): Timestamp of account creation
        updated_at (datetime): Timestamp of last account update
        last_login (datetime): Timestamp of last successful login
    """
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    username: Mapped[str] = mapped_column(String, unique=True)
    hashed_password: Mapped[str] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Use string reference to avoid circular import
    lists: Mapped[PyList["List"]] = relationship("List", back_populates="user", lazy="selectin")
    filter_settings: Mapped[PyList["FilterSettings"]] = relationship("FilterSettings", back_populates="user", lazy="selectin") 