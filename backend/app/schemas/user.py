"""
User Schema Module

This module defines Pydantic models for user-related operations.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID

class UserBase(BaseModel):
    """Base user schema with common attributes."""
    email: EmailStr
    username: Optional[str] = None

class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: Optional[str] = None  # Optional for Google auth users

class UserResponse(UserBase):
    """Schema for user responses, excluding sensitive data."""
    id: UUID
    is_active: bool = True
    username: str  # Username is required in responses

    class Config:
        """Pydantic config for ORM mode."""
        from_attributes = True  # New name for orm_mode in Pydantic v2 