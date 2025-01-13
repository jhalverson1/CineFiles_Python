"""
Lists Router

This module handles all list-related endpoints including creating, updating, and managing movie lists.
"""

from typing import Annotated, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, delete
from ..database.session import get_db
from ..models.user import User
from ..models.list_models import List as ListModel, ListItem
from ..schemas.list_schemas import (
    ListCreate,
    List as ListSchema,
    ListItemCreate,
    ListItem as ListItemSchema,
    ListStatusResponse,
    ListUpdate
)
from ..core.security import get_current_user
from ..services import list_service

router = APIRouter()

@router.get("", response_model=List[ListSchema])
async def get_user_lists(
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db)
):
    """Get all lists for the current user."""
    return await list_service.get_user_lists(db, current_user.id)

@router.post("", response_model=ListSchema)
async def create_list(
    list_data: ListCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db)
):
    """Create a new list for the current user."""
    db_list = ListModel(
        name=list_data.name,
        description=list_data.description,
        user_id=current_user.id
    )
    db.add(db_list)
    await db.commit()
    await db.refresh(db_list)
    return db_list

@router.post("/watched/{movie_id}", response_model=ListStatusResponse)
async def toggle_watched_status(
    movie_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db)
):
    """Toggle whether a movie is marked as watched by the current user."""
    return await list_service.toggle_watched_status(db, current_user.id, movie_id)

@router.post("/watchlist/{movie_id}", response_model=ListStatusResponse)
async def toggle_watchlist_status(
    movie_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db)
):
    """Toggle whether a movie is in the current user's watchlist."""
    return await list_service.toggle_watchlist_status(db, current_user.id, movie_id)

@router.post("/{list_id}/items", response_model=ListItemSchema)
async def add_movie_to_list(
    list_id: UUID,
    item_data: ListItemCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db)
):
    """Add a movie to a list."""
    # Verify list ownership
    db_list = await list_service.get_list_by_id(db, list_id)
    if not db_list or db_list.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )
    
    return await list_service.add_movie_to_list(
        db,
        list_id,
        item_data.movie_id,
        item_data.notes
    )

@router.delete("/{list_id}/items/{movie_id}")
async def remove_movie_from_list(
    list_id: UUID,
    movie_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db)
):
    """Remove a movie from a list."""
    # Verify list ownership
    db_list = await list_service.get_list_by_id(db, list_id)
    if not db_list or db_list.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )
    
    # Delete the list item
    query = delete(ListItem).where(
        and_(
            ListItem.list_id == list_id,
            ListItem.movie_id == movie_id
        )
    )
    await db.execute(query)
    await db.commit()
    return {"status": "success"}

@router.put("/{list_id}", response_model=ListSchema)
async def update_list(
    list_id: UUID,
    list_data: ListUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db)
):
    """Update an existing list's name and/or description."""
    # Verify list ownership
    db_list = await list_service.get_list_by_id(db, list_id)
    if not db_list or db_list.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )
    
    # Don't allow updating default lists
    if db_list.is_default:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot modify default lists"
        )
    
    # Validate new name if provided
    if list_data.name and list_data.name != db_list.name:
        name_available = await list_service.validate_list_name(
            db, 
            current_user.id, 
            list_data.name,
            exclude_list_id=list_id
        )
        if not name_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="List name already exists"
            )
    
    # Update the list
    updated_list = await list_service.update_list(
        db,
        list_id,
        name=list_data.name,
        description=list_data.description
    )
    return updated_list

@router.delete("/{list_id}")
async def delete_list(
    list_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db)
):
    """Delete a list and all its items."""
    # Verify list ownership
    db_list = await list_service.get_list_by_id(db, list_id)
    if not db_list or db_list.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )
    
    # Don't allow deleting default lists
    if db_list.is_default:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete default lists"
        )
    
    # Delete the list and its items
    success = await list_service.delete_list(db, list_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to delete list"
        )
    
    return {"status": "success"}

# ... rest of the file unchanged ... 