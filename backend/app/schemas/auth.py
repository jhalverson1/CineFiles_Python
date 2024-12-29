"""
Authentication Schema Module

This module defines Pydantic models for authentication-related operations.
"""

from pydantic import BaseModel, EmailStr

class GoogleAuthRequest(BaseModel):
    """Schema for Google authentication requests."""
    email: EmailStr 