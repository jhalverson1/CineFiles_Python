"""
Database Session Module

This module provides database session management for SQLAlchemy.
It handles both async and sync database connections.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker
from app.database.database import get_async_engine

# Create async session factory using our configured engine
AsyncSessionLocal = sessionmaker(
    get_async_engine(),
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

async def get_db() -> AsyncSession:
    """
    Get a database session.
    
    Yields:
        AsyncSession: Database session
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close() 