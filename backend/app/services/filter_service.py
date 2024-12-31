from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.filter_settings import FilterSettings
from app.schemas.filter_schemas import FilterSettingsCreate, FilterSettingsUpdate


async def create_filter_settings(
    db: AsyncSession,
    filter_settings: FilterSettingsCreate
) -> FilterSettings:
    """Create new filter settings."""
    db_filter_settings = FilterSettings(**filter_settings.model_dump())
    db.add(db_filter_settings)
    await db.commit()
    await db.refresh(db_filter_settings)
    return db_filter_settings


async def get_filter_settings(
    db: AsyncSession,
    filter_settings_id: int
) -> Optional[FilterSettings]:
    """Get filter settings by ID."""
    query = select(FilterSettings).where(FilterSettings.id == filter_settings_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def update_filter_settings(
    db: AsyncSession,
    db_filter_settings: FilterSettings,
    filter_settings: FilterSettingsUpdate
) -> FilterSettings:
    """Update filter settings."""
    update_data = filter_settings.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_filter_settings, field, value)
    
    await db.commit()
    await db.refresh(db_filter_settings)
    return db_filter_settings


async def delete_filter_settings(
    db: AsyncSession,
    db_filter_settings: FilterSettings
) -> None:
    """Delete filter settings."""
    await db.delete(db_filter_settings)
    await db.commit() 