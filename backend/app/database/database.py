from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import NullPool

SQLALCHEMY_DATABASE_URL = "postgresql+asyncpg://postgres:postgres@db:5432/cinefiles"

engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
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