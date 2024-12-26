async def init_db():
    try:
        async with engine.begin() as conn:
            # Run migrations
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise 