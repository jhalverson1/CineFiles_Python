from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "CineFiles API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    TMDB_BEARER_TOKEN: str = os.getenv("TMDB_BEARER_TOKEN")
    ALLOWED_ORIGINS: List[str] = [
        FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3001",
        "https://cinefiles-production.up.railway.app",
    ]

    class Config:
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings() 