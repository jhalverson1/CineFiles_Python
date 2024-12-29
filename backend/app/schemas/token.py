"""
Token Schema Module

This module defines Pydantic models for authentication tokens.
"""

from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    """Schema for authentication tokens."""
    access_token: str
    token_type: str
    username: Optional[str] = None 