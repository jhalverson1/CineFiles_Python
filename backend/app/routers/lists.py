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
    return await create_list(db, current_user.id, list_data.name, list_data.description)

@router.get("", response_model=PyList[List])
async def get_lists(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await get_user_lists(db, current_user.id)

@router.post("/{list_id}/items", response_model=ListItem)
async def add_to_list(
    list_id: UUID,
    item: ListItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
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
    """Toggle whether a movie is marked as watched"""
    is_watched = await toggle_watched_status(db, current_user.id, movie_id)
    return {"is_watched": is_watched} 