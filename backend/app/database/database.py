from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import NullPool
from app.core.config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()

engine = create_async_engine(
    settings.DATABASE_URL,
    poolclass=NullPool,
)

SessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()

async def get_db():
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    try:
        async with engine.begin() as conn:
            # Run migrations
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise 