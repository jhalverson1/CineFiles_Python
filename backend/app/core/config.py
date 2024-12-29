"""
Configuration Module

This module handles application configuration using environment variables.
It provides a centralized way to manage settings across the application.

Features:
- Environment-based configuration
- Type validation with Pydantic
- Default values for development
"""

from functools import lru_cache
from typing import List, Optional
from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    """
    Application settings with environment variable support.
    
    Attributes:
        PROJECT_NAME: Name of the project
        DEBUG: Debug mode flag
        API_V1_STR: API version prefix
        CORS_ORIGINS: List of allowed CORS origins
        DATABASE_URL: Database connection string
        SECRET_KEY: JWT secret key
        ALGORITHM: JWT algorithm
        ACCESS_TOKEN_EXPIRE_MINUTES: JWT token expiration time
    """
    # Base settings
    PROJECT_NAME: str = "CineFiles"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    
    # CORS settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:3001",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:8080",
        "https://frontend-staging-386d.up.railway.app",
        "https://frontend-production-a118.up.railway.app"
    ]
    
    # Database settings
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/cinefiles"
    
    # JWT settings
    SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your-secret-key-for-development")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # External API settings
    TMDB_BEARER_TOKEN: Optional[str] = None

    class Config:
        case_sensitive = True
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    """
    Create and cache application settings.
    
    Returns:
        Settings: Application settings instance
    """
    return Settings()

settings = get_settings()