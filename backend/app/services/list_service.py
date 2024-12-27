from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.list_models import List, ListItem
from ..models.user import User

async def create_list(db: AsyncSession, user_id: UUID, name: str, description: str = None) -> List:
    db_list = List(
        user_id=user_id,
        name=name,
        description=description,
        is_default=False
    )
    db.add(db_list)
    await db.commit()
    await db.refresh(db_list)
    return db_list

async def create_default_lists(db: AsyncSession, user: User) -> None:
    """Create default lists for a new user"""
    default_lists = [
        {"name": "Watched", "description": "Movies you have watched"},
        {"name": "Watchlist", "description": "Movies you want to watch"}
    ]
    
    for list_data in default_lists:
        db_list = List(
            user_id=user.id,
            name=list_data["name"],
            description=list_data["description"],
            is_default=True
        )
        db.add(db_list)
    
    await db.commit()

async def get_user_lists(db: AsyncSession, user_id: UUID) -> list[List]:
    query = (
        select(List)
        .options(joinedload(List.items))
        .where(List.user_id == user_id)
    )
    result = await db.execute(query)
    return result.unique().scalars().all()

async def add_movie_to_list(
    db: AsyncSession, 
    list_id: UUID, 
    movie_id: str, 
    notes: str = None
) -> ListItem:
    list_item = ListItem(
        list_id=list_id,
        movie_id=movie_id,
        notes=notes
    )
    db.add(list_item)
    await db.commit()
    await db.refresh(list_item)
    return list_item 

async def get_or_create_watched_list(db: AsyncSession, user_id: UUID) -> List:
    """Get or create the Watched list for a user"""
    query = select(List).where(
        (List.user_id == user_id) & (List.name == "Watched")
    )
    result = await db.execute(query)
    watched_list = result.scalar_one_or_none()
    
    if not watched_list:
        watched_list = List(
            user_id=user_id,
            name="Watched",
            description="Movies you have watched",
            is_default=True
        )
        db.add(watched_list)
        await db.commit()
        await db.refresh(watched_list)
    
    return watched_list

async def toggle_watched_status(db: AsyncSession, user_id: UUID, movie_id: str) -> bool:
    """Toggle a movie's watched status. Returns new status"""
    watched_list = await get_or_create_watched_list(db, user_id)
    
    # Check if movie is already in the list
    query = select(ListItem).where(
        (ListItem.list_id == watched_list.id) & 
        (ListItem.movie_id == movie_id)
    )
    result = await db.execute(query)
    list_item = result.scalar_one_or_none()
    
    if list_item:
        # Remove from watched list
        await db.delete(list_item)
        await db.commit()
        return False
    else:
        # Add to watched list
        list_item = ListItem(
            list_id=watched_list.id,
            movie_id=movie_id
        )
        db.add(list_item)
        await db.commit()
        return True 