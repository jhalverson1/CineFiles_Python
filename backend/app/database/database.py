from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import NullPool
from app.core.config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()

# Create Base class for models
Base = declarative_base()

def get_sync_engine():
    sync_url = str(settings.DATABASE_URL).replace('postgresql+asyncpg', 'postgresql+psycopg2')
    from sqlalchemy import create_engine
    return create_engine(sync_url, poolclass=NullPool)

def get_async_engine():
    return create_async_engine(
        settings.DATABASE_URL,
        poolclass=NullPool,
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