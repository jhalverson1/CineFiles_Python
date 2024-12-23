from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
from dotenv import load_dotenv
import httpx
from fastapi import HTTPException
from utils.scraper import scrape_movie_news
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI()

# Configure CORS with logging
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
logger.debug(f"Frontend URL from env: {frontend_url}")

origins = [
    "https://frontend-production-a118.up.railway.app",
    "http://localhost:3000",
    "https://backend-production-e6f3.up.railway.app",
    frontend_url
]

logger.debug(f"Configuring CORS with allowed origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Add a middleware to set CORS headers explicitly
@app.middleware("http")
async def add_cors_headers(request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = request.headers.get("origin", frontend_url)
    return response

@app.middleware("http")
async def log_requests(request, call_next):
    logger.debug(f"Incoming request: {request.method} {request.url}")
    logger.debug(f"Headers: {request.headers}")
    response = await call_next(request)
    logger.debug(f"Response status: {response.status_code}")
    return response

async def fetch_tmdb_data(endpoint):
    bearer_token = os.getenv("TMDB_BEARER_TOKEN")
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {bearer_token}"
    }
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.themoviedb.org/3{endpoint}",
                headers=headers
            )
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=f"Error fetching from TMDB: {endpoint}")
            data = response.json()
            return data.get("results", [])
    except Exception as e:
        print(f"Error fetching from TMDB: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/hello")
async def read_root():
    return {"message": "Hello from FastAPI!"}

@app.get("/api/movies/popular")
async def get_popular_movies():
    return await fetch_tmdb_data("/movie/popular?language=en-US&page=1")

@app.get("/api/movies/top-rated")
async def get_top_rated_movies():
    return await fetch_tmdb_data("/movie/top_rated?language=en-US&page=1")

@app.get("/api/movies/upcoming")
async def get_upcoming_movies():
    return await fetch_tmdb_data("/movie/upcoming?language=en-US&page=1")

@app.get("/api/movies/news")
async def get_movie_news():
    try:
        logger.debug("Starting movie news fetch")
        news = await scrape_movie_news()
        logger.debug(f"Fetched {len(news) if news else 0} news items")
        if not news:
            logger.warning("No news items found")
            return {"error": "No news found", "items": []}
        return {"items": news}
    except Exception as e:
        logger.error(f"Error in get_movie_news: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch movie news: {str(e)}"
        )

@app.get("/api/movies")
async def get_movies():
    bearer_token = os.getenv("TMDB_BEARER_TOKEN")
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {bearer_token}"
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.themoviedb.org/3/movie/popular",
            headers=headers
        )
        return response.json()

@app.get("/api/movies/search")
async def search_movies(query: str = Query(..., min_length=1)):
    bearer_token = os.getenv("TMDB_BEARER_TOKEN")
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {bearer_token}"
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.themoviedb.org/3/search/movie",
            headers=headers,
            params={"query": query}
        )
        return response.json()

@app.get("/api/movies/{id}")
async def get_movie_details(id: int):
    bearer_token = os.getenv("TMDB_BEARER_TOKEN")
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {bearer_token}"
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.themoviedb.org/3/movie/{id}",
            headers=headers
        )
        return response.json()

@app.get("/api/movies/{id}/credits")
async def get_movie_credits(id: int):
    bearer_token = os.getenv("TMDB_BEARER_TOKEN")
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {bearer_token}"
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.themoviedb.org/3/movie/{id}/credits",
            headers=headers
        )
        return response.json()

@app.get("/api/movies/{id}/videos")
async def get_movie_videos(id: int):
    bearer_token = os.getenv("TMDB_BEARER_TOKEN")
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {bearer_token}"
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.themoviedb.org/3/movie/{id}/videos",
            headers=headers
        )
        return response.json()

@app.get("/api/person/{id}")
async def get_person_details(id: int):
    bearer_token = os.getenv("TMDB_BEARER_TOKEN")
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {bearer_token}"
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.themoviedb.org/3/person/{id}/external_ids",
            headers=headers
        )
        return response.json()

@app.get("/")
async def root():
    return {
        "status": "healthy",
        "version": "1.0",
        "endpoints": [
            "/api/movies/popular",
            "/api/movies/top-rated",
            "/api/movies/upcoming",
            "/api/movies/news"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)