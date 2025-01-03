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

# ... rest of the file unchanged ... 