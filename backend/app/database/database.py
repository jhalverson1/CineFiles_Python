"""
Database Module

This module provides core database functionality:
- Base models
- Session management
- Engine configuration
- Migration support

All database-related core functionality is centralized here.
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import QueuePool
from app.core.config import get_settings
import logging
from urllib.parse import urlparse, urlunparse

logger = logging.getLogger(__name__)
settings = get_settings()

# Create Base class for models
Base = declarative_base()

def get_sync_engine():
    """
    Get a synchronous engine - ONLY FOR USE WITH ALEMBIC MIGRATIONS
    This should not be used in the application code.
    """
    # Parse the URL to ensure correct format
    parsed = urlparse(str(settings.DATABASE_URL))
    # Force psycopg2 driver for sync operations
    if parsed.scheme.endswith('+asyncpg'):
        sync_url = urlunparse(parsed._replace(scheme='postgresql'))
    else:
        sync_url = str(settings.DATABASE_URL)
    
    logger.info(f"Creating sync engine with URL scheme: {urlparse(sync_url).scheme}")
    from sqlalchemy import create_engine
    return create_engine(sync_url, poolclass=QueuePool)

def get_async_engine():
    # Parse the URL to ensure correct format
    parsed = urlparse(str(settings.DATABASE_URL))
    # Force asyncpg driver for async operations
    if not parsed.scheme.endswith('+asyncpg'):
        async_url = urlunparse(parsed._replace(scheme='postgresql+asyncpg'))
    else:
        async_url = str(settings.DATABASE_URL)
    
    logger.info(f"Creating async engine with URL scheme: {urlparse(async_url).scheme}")
    return create_async_engine(
        async_url,
        pool_size=20,  # Maximum number of connections in the pool
        max_overflow=10,  # Maximum number of connections that can be created beyond pool_size
        pool_timeout=30,  # Timeout for getting a connection from the pool
        pool_pre_ping=True,  # Enable connection health checks
        pool_recycle=3600,  # Recycle connections after 1 hour
        echo=settings.DEBUG,  # SQL query logging based on debug mode
    )

# Create session factory
def get_session_maker():
    return sessionmaker(
        get_async_engine(),
        class_=AsyncSession,
        expire_on_commit=False,
    )

async def get_db():
    session_maker = get_session_maker()
    async with session_maker() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    try:
        engine = get_async_engine()
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise 