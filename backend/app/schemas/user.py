"""
User Schemas

This module defines Pydantic models for user data validation and serialization.
It provides a hierarchy of schemas for different user-related operations.

Schema Hierarchy:
- UserBase: Common user fields (email, username)
- UserCreate: Used for user registration (adds password)
- User: Complete user representation (adds system fields)
- UserInDB: Internal representation (adds hashed password)

Features:
- Email validation using Pydantic's EmailStr
- Optional fields with proper typing
- ORM mode support for SQLAlchemy integration
- Secure password handling
"""

from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    """
    Base user schema containing common fields.
    
    This schema defines the basic fields that are common to all user-related operations.
    It serves as the foundation for other user schemas.
    
    Attributes:
        email (EmailStr): Validated email address
        username (str): User's chosen username
    """
    email: EmailStr
    username: str

class UserCreate(UserBase):
    """
    Schema for user registration.
    
    Extends UserBase to include the password field needed for account creation.
    The password is only used during registration and is never returned in responses.
    
    Attributes:
        password (str): Plain text password (will be hashed before storage)
    """
    password: str

class User(UserBase):
    """
    Complete user representation for API responses.
    
    This schema includes all user fields that are safe to expose through the API.
    It excludes sensitive information like passwords.
    
    Attributes:
        id (UUID): User's unique identifier
        is_active (bool): Account status flag
        is_superuser (bool): Administrative privileges flag
        created_at (datetime): Account creation timestamp
        updated_at (datetime, optional): Last update timestamp
        last_login (datetime, optional): Last login timestamp
    """
    id: UUID
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserInDB(User):
    """
    Internal user representation with sensitive data.
    
    This schema is used for internal operations and includes the hashed password.
    It should never be exposed through the API.
    
    Attributes:
        hashed_password (str): Bcrypt-hashed password
    """
    hashed_password: str 