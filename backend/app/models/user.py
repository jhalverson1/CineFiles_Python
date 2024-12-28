"""
User Model

This module defines the User SQLAlchemy model for the application's user management system.
It handles user authentication, authorization, and relationships with other models.

The User model includes:
- Basic user information (email, username)
- Authentication fields (hashed password)
- Status flags (active, superuser)
- Timestamps (creation, updates, last login)
- Relationships with movie lists

Features:
- UUID-based primary keys for security
- Indexed email and username fields for fast lookups
- Automatic timestamp management
- Cascading deletion of associated lists
"""

from datetime import datetime
from uuid import uuid4
from sqlalchemy import Boolean, Column, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import relationship

from ..database.database import Base

class User(Base):
    """
    SQLAlchemy model representing a user in the system.
    
    Attributes:
        id (UUID): Primary key, automatically generated UUID4
        email (str): Unique email address, indexed
        username (str): Unique username, indexed
        hashed_password (str): Bcrypt-hashed password
        is_active (bool): Whether the user account is active
        is_superuser (bool): Whether the user has admin privileges
        created_at (datetime): Timestamp of account creation
        updated_at (datetime): Timestamp of last account update
        last_login (datetime): Timestamp of last successful login
        lists (relationship): One-to-many relationship with List model
    
    Notes:
        - Email and username must be unique across all users
        - Passwords are never stored in plain text
        - Timestamps are stored in UTC with timezone information
        - Deleting a user automatically deletes all their lists
    """
    __tablename__ = "users"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Use string reference to avoid circular import
    lists = relationship("List", back_populates="user", cascade="all, delete-orphan") 