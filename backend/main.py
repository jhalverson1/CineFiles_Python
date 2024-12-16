from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
from dotenv import load_dotenv
import httpx
from fastapi import HTTPException
from utils.scraper import scrape_movie_news

load_dotenv()  # Load environment variables from .env file

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://jhalverson1.github.io/CineFiles_Python"],  # React default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    return await scrape_movie_news()

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)