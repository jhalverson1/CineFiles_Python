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
from sqlalchemy import Boolean, Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from ..db.base import Base

class User(Base):
    """
    SQLAlchemy model representing a user in the system.
    
    Attributes:
        id (UUID): Primary key, auto-generated UUID
        email (str): Unique email address, indexed
        username (str, optional): Optional username
        hashed_password (str, optional): Bcrypt-hashed password, nullable for Google auth
        is_active (bool): Whether the user account is active
        created_at (datetime): Timestamp of account creation
        updated_at (datetime): Timestamp of last account update
        last_login (datetime): Timestamp of last successful login
    """
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, server_default=func.uuid_generate_v4())
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True, nullable=True)  # Make username optional
    hashed_password = Column(String, nullable=True)  # Nullable for Google auth users
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True) 