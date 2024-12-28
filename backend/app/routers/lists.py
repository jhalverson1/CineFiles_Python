"""
Lists Router

This module handles all movie list management functionality, allowing users to create
and manage custom movie lists and track their watched movies.

Features:
- Create and retrieve custom movie lists
- Add movies to lists with optional notes
- Track watched/unwatched status of movies
- Automatic list creation for new users
- List ownership verification for security

All endpoints require authentication and enforce user ownership of lists.
Lists are identified by UUIDs and support custom names and descriptions.
"""

from typing import List as PyList
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database.database import get_db
from ..models.user import User
from ..schemas.list_schemas import ListCreate, List, ListItemCreate, ListItem
from ..services.list_service import (
    create_list, 
    get_user_lists, 
    add_movie_to_list,
    toggle_watched_status
)
from ..utils.auth import get_current_user

router = APIRouter(
    prefix="/api/v1/lists",
    tags=["lists"]
)

@router.post("", response_model=List)
async def create_new_list(
    list_data: ListCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new movie list for the authenticated user.
    
    Args:
        list_data: ListCreate schema containing:
            - name: Name of the list
            - description: Optional description of the list
        current_user: Authenticated user from JWT token
        db: Database session
    
    Returns:
        List: Created list information including:
            - id: UUID of the created list
            - name: List name
            - description: List description
            - created_at: Creation timestamp
            - user_id: Owner's user ID
    
    Notes:
        - List names must be unique per user
        - Lists are private and only accessible by their owner
    """
    return await create_list(db, current_user.id, list_data.name, list_data.description)

@router.get("", response_model=PyList[List])
async def get_lists(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all movie lists belonging to the authenticated user.
    
    Args:
        current_user: Authenticated user from JWT token
        db: Database session
    
    Returns:
        List[List]: Array of user's lists, each containing:
            - id: List UUID
            - name: List name
            - description: List description
            - created_at: Creation timestamp
            - user_id: Owner's user ID
    
    Notes:
        - Includes both default and custom-created lists
        - Lists are ordered by creation date (newest first)
    """
    return await get_user_lists(db, current_user.id)

@router.post("/{list_id}/items", response_model=ListItem)
async def add_to_list(
    list_id: UUID,
    item: ListItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Add a movie to a specific list.
    
    Args:
        list_id: UUID of the target list
        item: ListItemCreate schema containing:
            - movie_id: TMDB ID of the movie
            - notes: Optional notes about the movie
        current_user: Authenticated user from JWT token
        db: Database session
    
    Returns:
        ListItem: Created list item containing:
            - id: Item UUID
            - list_id: Parent list UUID
            - movie_id: TMDB movie ID
            - notes: User notes
            - added_at: Addition timestamp
    
    Raises:
        HTTPException: If user doesn't own the specified list
    
    Notes:
        - Verifies list ownership before adding
        - Duplicate movies are not allowed in the same list
    """
    # Verify list belongs to user
    lists = await get_user_lists(db, current_user.id)
    if not any(lst.id == list_id for lst in lists):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this list"
        )
    
    return await add_movie_to_list(db, list_id, item.movie_id, item.notes)

@router.post("/watched/{movie_id}")
async def toggle_movie_watched(
    movie_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Toggle the watched status of a movie for the current user.
    
    Args:
        movie_id: TMDB ID of the movie
        current_user: Authenticated user from JWT token
        db: Database session
    
    Returns:
        dict: Contains:
            - is_watched: Boolean indicating new watched status
    
    Notes:
        - Automatically creates "Watched" list if it doesn't exist
        - Adds/removes movie from user's watched list
        - Status is toggled: unwatched -> watched, watched -> unwatched
    """
    is_watched = await toggle_watched_status(db, current_user.id, movie_id)
    return {"is_watched": is_watched} 