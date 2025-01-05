import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from typing import Generator, AsyncGenerator

from app.main import app
from app.core.config import get_settings
from app.database.database import get_db, Base

# Get settings for test environment
settings = get_settings()

# Test database URL - using PostgreSQL
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5433/cinefiles_test"
)

# Create async engine for testing
engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=True  # Set to False in production tests
)

# Create test session
TestingSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Override the dependency
async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session")
def test_client() -> Generator:
    with TestClient(app) as client:
        yield client

@pytest.fixture(autouse=True)
async def setup_database():
    """
    Create a fresh test database for each test session.
    This fixture runs automatically before any tests are executed.
    """
    # Drop all tables to ensure a clean state
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    yield  # Run the tests
    
    # Cleanup after tests
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all) 