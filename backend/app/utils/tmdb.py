from app.core.config import get_settings

settings = get_settings()

TMDB_BASE_URL = "https://api.themoviedb.org/3"
HEADERS = {
    "Authorization": f"Bearer {settings.TMDB_BEARER_TOKEN}",
    "accept": "application/json"
}

def get_tmdb_url(path: str) -> str:
    return f"{TMDB_BASE_URL}/{path}" 