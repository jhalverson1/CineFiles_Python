"""
Filter Settings Router

This module handles all filter settings-related endpoints including creating,
reading, updating, and deleting filter settings.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
import logging

from ..database.database import get_db
from ..models.user import User
from ..models.filter_settings import FilterSettings
from ..schemas.filter_schemas import FilterSettingsCreate, FilterSettingsUpdate, FilterSettings as FilterSettingsSchema
from ..utils.auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("", response_model=FilterSettingsSchema)
async def create_filter_setting(
    filter_setting: FilterSettingsCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new filter setting for the current user.
    
    Args:
        filter_setting: Filter setting data
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        FilterSettingsSchema: Created filter setting
    """
    db_filter_setting = FilterSettings(
        **filter_setting.model_dump(),
        user_id=current_user.id
    )
    db.add(db_filter_setting)
    await db.commit()
    await db.refresh(db_filter_setting)
    return db_filter_setting

@router.get("", response_model=List[FilterSettingsSchema])
async def get_filter_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all filter settings for the current user.
    
    Args:
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        List[FilterSettingsSchema]: List of user's filter settings
    """
    logger.info(f"Fetching filter settings for user {current_user.id}")
    query = select(FilterSettings).where(FilterSettings.user_id == current_user.id)
    result = await db.execute(query)
    filters = result.scalars().all()
    logger.info(f"Found {len(filters)} filter settings for user {current_user.id}")
    return filters

@router.get("/{filter_setting_id}", response_model=FilterSettingsSchema)
async def get_filter_setting(
    filter_setting_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific filter setting by ID.
    
    Args:
        filter_setting_id: ID of the filter setting to retrieve
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        FilterSettingsSchema: Filter setting if found
        
    Raises:
        HTTPException: If filter setting not found or doesn't belong to user
    """
    query = select(FilterSettings).where(
        FilterSettings.id == filter_setting_id,
        FilterSettings.user_id == current_user.id
    )
    result = await db.execute(query)
    filter_setting = result.scalar_one_or_none()
    
    if not filter_setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Filter setting not found"
        )
    
    return filter_setting

@router.put("/{filter_setting_id}", response_model=FilterSettingsSchema)
async def update_filter_setting(
    filter_setting_id: int,
    filter_setting_update: FilterSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a specific filter setting.
    
    Args:
        filter_setting_id: ID of the filter setting to update
        filter_setting_update: Updated filter setting data
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        FilterSettingsSchema: Updated filter setting
        
    Raises:
        HTTPException: If filter setting not found or doesn't belong to user
    """
    query = select(FilterSettings).where(
        FilterSettings.id == filter_setting_id,
        FilterSettings.user_id == current_user.id
    )
    result = await db.execute(query)
    db_filter_setting = result.scalar_one_or_none()
    
    if not db_filter_setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Filter setting not found"
        )
    
    update_data = filter_setting_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_filter_setting, field, value)
    
    await db.commit()
    await db.refresh(db_filter_setting)
    return db_filter_setting

@router.delete("/{filter_setting_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_filter_setting(
    filter_setting_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a specific filter setting.
    
    Args:
        filter_setting_id: ID of the filter setting to delete
        current_user: Current authenticated user
        db: Database session
        
    Raises:
        HTTPException: If filter setting not found or doesn't belong to user
    """
    query = select(FilterSettings).where(
        FilterSettings.id == filter_setting_id,
        FilterSettings.user_id == current_user.id
    )
    result = await db.execute(query)
    db_filter_setting = result.scalar_one_or_none()
    
    if not db_filter_setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Filter setting not found"
        )
    
    await db.delete(db_filter_setting)
    await db.commit() 