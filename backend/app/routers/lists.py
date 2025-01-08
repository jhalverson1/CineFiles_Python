"""
Lists Router

This module handles all list-related endpoints including creating, updating, and managing movie lists.
"""

from typing import List, Optional, Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from ..database.database import get_db
from ..models.list_models import List as ListModel, ListItem
from ..models.user import User
from ..schemas.list_schemas import (
    ListCreate,
    List as ListSchema,
    ListUpdate,
    ListItemCreate,
    ListItem as ListItemSchema,
    ListBase
)
from ..schemas.movie import MovieResponse
from ..core.security import get_current_user

router = APIRouter()

@router.get("", response_model=List[ListSchema])
async def get_lists(
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db)
):
    """Get all lists for the current user."""
    query = (
        select(ListModel)
        .where(ListModel.user_id == current_user.id)
        .options(joinedload(ListModel.items))
    )
    result = await db.execute(query)
    lists = result.unique().scalars().all()
    return lists

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

@router.post("/watched/{movie_id}")
async def toggle_watched_status(
    movie_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db)
):
    """Toggle whether a movie is marked as watched by the current user."""
    from ..services.list_service import toggle_watched_status
    return await toggle_watched_status(db, current_user.id, movie_id)

@router.post("/watchlist/{movie_id}")
async def toggle_watchlist_status(
    movie_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db)
):
    """Toggle whether a movie is in the current user's watchlist."""
    from ..services.list_service import toggle_watchlist_status
    return await toggle_watchlist_status(db, current_user.id, movie_id)

# ... rest of the file unchanged ... 