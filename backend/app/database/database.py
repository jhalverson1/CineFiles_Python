from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import NullPool
import os

# Get the DATABASE_URL from environment variable, with a fallback for local development
DATABASE_URL = os.getenv("DATABASE_URL")

# Handle Railway's postgres:// vs postgresql:// URL scheme
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Fallback to local database if no DATABASE_URL is provided
if not DATABASE_URL:
    DATABASE_URL = "postgresql+asyncpg://postgres:postgres@db:5432/cinefiles"

engine = create_async_engine(
    DATABASE_URL,
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