import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from httpx import AsyncClient
import json

@pytest.mark.asyncio
async def test_get_movie_genres(test_client):
    """
    Test the /genres endpoint
    
    This test verifies that:
    1. The endpoint returns a 200 status code
    2. The response contains a 'genres' key
    3. Each genre has an 'id' and 'name'
    4. The response matches the expected TMDB format
    """
    # Mock response data that matches TMDB API format
    mock_genres_response = {
        "genres": [
            {"id": 28, "name": "Action"},
            {"id": 12, "name": "Adventure"},
            {"id": 16, "name": "Animation"}
        ]
    }
    
    # Create a mock response
    mock_response = MagicMock()
    mock_response.is_success = True
    mock_response.status_code = 200
    mock_response.json.return_value = mock_genres_response
    
    # Create an async mock for the get method
    async_mock = AsyncMock(return_value=mock_response)
    
    # Use unittest.mock to patch the httpx.AsyncClient.get method
    with patch('httpx.AsyncClient.get', new=async_mock):
        # Make request to our endpoint
        response = test_client.get("/api/movies/genres")
        
        # Verify the response
        assert response.status_code == 200
        data = response.json()
        
        # Check response structure
        assert "genres" in data
        assert isinstance(data["genres"], list)
        
        # Verify each genre has required fields
        for genre in data["genres"]:
            assert "id" in genre
            assert "name" in genre
            assert isinstance(genre["id"], int)
            assert isinstance(genre["name"], str)
        
        # Verify mock was called once
        assert async_mock.call_count == 1 