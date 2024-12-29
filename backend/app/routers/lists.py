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
from ..schemas.list_schemas import ListCreate, List, ListItemCreate, ListItem, ListUpdate
from ..services.list_service import (
    create_list, 
    get_user_lists, 
    add_movie_to_list,
    toggle_watched_status,
    toggle_watchlist_status,
    get_list_by_id,
    validate_list_name,
    update_list,
    delete_list
)
from ..utils.auth import get_current_user

router = APIRouter(
    prefix="/api/lists",
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

@router.post("/watchlist/{movie_id}")
async def toggle_movie_watchlist(
    movie_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Toggle whether a movie is in the user's watchlist.
    
    Args:
        movie_id: TMDB ID of the movie
        current_user: Authenticated user from JWT token
        db: Database session
    
    Returns:
        dict: Contains:
            - in_watchlist: Boolean indicating if movie is in watchlist
    
    Notes:
        - Automatically creates "Watchlist" list if it doesn't exist
        - Adds/removes movie from user's watchlist
        - Status is toggled: not in list -> in list, in list -> not in list
    """
    in_watchlist = await toggle_watchlist_status(db, current_user.id, movie_id)
    return {"in_watchlist": in_watchlist} 

@router.get("/{list_id}", response_model=List)
async def get_list(
    list_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve a specific list by its ID.
    
    Args:
        list_id: UUID of the list to retrieve
        current_user: Authenticated user from JWT token
        db: Database session
    
    Returns:
        List: Complete list information with items
    
    Raises:
        HTTPException: If list doesn't exist or user doesn't own it
    
    Notes:
        - Verifies list ownership before returning
        - Items are eagerly loaded for efficiency
    """
    list_obj = await get_list_by_id(db, list_id)
    if not list_obj or list_obj.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )
    return list_obj

@router.patch("/{list_id}", response_model=List)
async def update_list_details(
    list_id: UUID,
    list_data: ListUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a list's name and/or description.
    
    Args:
        list_id: UUID of the list to update
        list_data: ListUpdate schema containing:
            - name: Optional new name
            - description: Optional new description
        current_user: Authenticated user from JWT token
        db: Database session
    
    Returns:
        List: Updated list information
    
    Raises:
        HTTPException: If list doesn't exist, user doesn't own it,
                      or new name is already taken
    
    Notes:
        - Verifies list ownership before updating
        - Validates new name availability (case-insensitive)
        - Only updates provided fields
    """
    # Verify list exists and user owns it
    list_obj = await get_list_by_id(db, list_id)
    if not list_obj or list_obj.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )
    
    # If name is being updated, validate it
    if list_data.name:
        name_available = await validate_list_name(
            db, 
            current_user.id, 
            list_data.name,
            exclude_list_id=list_id
        )
        if not name_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A list with this name already exists"
            )
    
    updated_list = await update_list(
        db,
        list_id,
        name=list_data.name,
        description=list_data.description
    )
    return updated_list

@router.delete("/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_list_endpoint(
    list_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a list and all its items.
    
    Args:
        list_id: UUID of the list to delete
        current_user: Authenticated user from JWT token
        db: Database session
    
    Raises:
        HTTPException: If list doesn't exist, user doesn't own it,
                      or it's a default list
    
    Notes:
        - Verifies list ownership before deletion
        - Prevents deletion of default lists
        - Cascades deletion to all list items
    """
    # Verify list exists and user owns it
    list_obj = await get_list_by_id(db, list_id)
    if not list_obj or list_obj.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )
    
    # Prevent deletion of default lists
    if list_obj.is_default:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete default lists"
        )
    
    success = await delete_list(db, list_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete list"
        ) 

@router.delete("/{list_id}/items/{movie_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_list(
    list_id: UUID,
    movie_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Remove a movie from a specific list.
    
    Args:
        list_id: UUID of the target list
        movie_id: TMDB ID of the movie to remove
        current_user: Authenticated user from JWT token
        db: Database session
    
    Raises:
        HTTPException: If user doesn't own the list or movie isn't in the list
    
    Notes:
        - Verifies list ownership before removing
        - Returns 204 No Content on success
    """
    # Verify list belongs to user
    list_obj = await get_list_by_id(db, list_id)
    if not list_obj or list_obj.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )
    
    # Find and delete the list item
    from sqlalchemy import and_
    from ..models.list_models import ListItem
    
    query = ListItem.__table__.delete().where(
        and_(
            ListItem.list_id == list_id,
            ListItem.movie_id == movie_id
        )
    )
    result = await db.execute(query)
    await db.commit()
    
    if result.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie not found in list"
        ) 