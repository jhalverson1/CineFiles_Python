# CineFiles

A movie discovery platform built with React and FastAPI.

## Features
- Browse popular, top-rated, and upcoming movies
- Search for movies
- View detailed movie information
- Latest movie news from r/movies

## Setup
1. Clone the repository
2. Install dependencies:   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd backend
   pip install -r requirements.txt   ```
3. Copy `.env.example` to `.env` and fill in your API keys
4. Start the development servers:   ```bash
   # Frontend
   npm start

   # Backend
   uvicorn main:app --reload   ```

## Environment Variables
- `REACT_APP_API_URL`: Backend API URL
- `TMDB_BEARER_TOKEN`: TMDB API token
- `REDDIT_CLIENT_ID`: Reddit API client ID
- `REDDIT_CLIENT_SECRET`: Reddit API client secret 