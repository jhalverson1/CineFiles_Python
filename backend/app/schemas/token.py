"""
Token Schema Module

This module defines Pydantic models for authentication tokens.
"""

from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    """Schema for authentication tokens."""
    access_token: str
    refresh_token: str
    token_type: str
    username: Optional[str] = None

class TokenPayload(BaseModel):
    """Schema for token payload."""
    sub: str
    exp: int
    token_type: str 