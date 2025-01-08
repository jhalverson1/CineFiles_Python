"""
List Service

This module provides the business logic for managing movie lists and list items.
It handles all database operations related to creating, retrieving, and modifying lists.

Key Features:
- List creation and management
- Default list handling for new users
- Movie addition to lists
- Watched status tracking
- Efficient database queries with joins
- Transaction management

The service layer abstracts database operations from the API routes and
ensures consistent business logic across the application.
"""

from uuid import UUID
from sqlalchemy import select, and_, delete
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.list_models import List, ListItem
from ..models.user import User
from typing import Dict, List as TypeList, Optional, Tuple

async def create_list(db: AsyncSession, user_id: UUID, name: str, description: str = None) -> List:
    """
    Create a new custom movie list for a user.
    
    Args:
        db: Database session
        user_id: UUID of the list owner
        name: Name of the list
        description: Optional description of the list
    
    Returns:
        List: Created list object with all fields populated
    
    Notes:
        - Lists are private to the creating user
        - Created with is_default=False for custom lists
        - Commits transaction immediately
    """
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

async def get_user_default_lists(db: AsyncSession, user_id: UUID) -> Tuple[List, List]:
    """
    Get or create both default lists (Watched and Watchlist) for a user in a single query.
    
    Args:
        db: Database session
        user_id: UUID of the user
    
    Returns:
        Tuple[List, List]: A tuple containing (watched_list, watchlist)
    """
    # Query both lists in a single database call
    query = select(List).where(
        and_(
            List.user_id == user_id,
            List.is_default == True,
            List.name.in_(["Watched", "Watchlist"])
        )
    )
    result = await db.execute(query)
    existing_lists = result.scalars().all()
    
    watched_list = next((l for l in existing_lists if l.name == "Watched"), None)
    watchlist = next((l for l in existing_lists if l.name == "Watchlist"), None)
    
    # Create any missing default lists
    if not watched_list:
        watched_list = List(
            user_id=user_id,
            name="Watched",
            description="Movies you have watched",
            is_default=True
        )
        db.add(watched_list)
    
    if not watchlist:
        watchlist = List(
            user_id=user_id,
            name="Watchlist",
            description="Movies you want to watch",
            is_default=True
        )
        db.add(watchlist)
    
    if not watched_list or not watchlist:
        await db.commit()
        if not watched_list:
            await db.refresh(watched_list)
        if not watchlist:
            await db.refresh(watchlist)
    
    return watched_list, watchlist

async def get_movie_list_status(
    db: AsyncSession,
    user_id: UUID,
    movie_id: str
) -> Dict[str, bool]:
    """
    Get the watched and watchlist status for a movie in a single query.
    
    Args:
        db: Database session
        user_id: UUID of the user
        movie_id: TMDB ID of the movie
    
    Returns:
        Dict[str, bool]: Dictionary with 'is_watched' and 'in_watchlist' status
    """
    watched_list, watchlist = await get_user_default_lists(db, user_id)
    
    # Query both statuses in a single database call
    query = select(ListItem).where(
        and_(
            ListItem.movie_id == movie_id,
            ListItem.list_id.in_([watched_list.id, watchlist.id])
        )
    )
    result = await db.execute(query)
    items = result.scalars().all()
    
    return {
        'is_watched': any(item.list_id == watched_list.id for item in items),
        'in_watchlist': any(item.list_id == watchlist.id for item in items)
    }

async def toggle_watched_status(
    db: AsyncSession,
    user_id: UUID,
    movie_id: str
) -> Dict[str, bool]:
    """
    Toggle whether a movie is marked as watched by a user.
    
    Args:
        db: Database session
        user_id: UUID of the user
        movie_id: TMDB ID of the movie
    
    Returns:
        Dict[str, bool]: Dictionary with updated 'is_watched' and 'in_watchlist' status
    """
    watched_list, watchlist = await get_user_default_lists(db, user_id)
    
    # Get current status
    status = await get_movie_list_status(db, user_id, movie_id)
    
    try:
        if status['is_watched']:
            # Remove from watched list
            await db.execute(
                delete(ListItem).where(
                    and_(
                        ListItem.list_id == watched_list.id,
                        ListItem.movie_id == movie_id
                    )
                )
            )
            new_status = {'is_watched': False, 'in_watchlist': status['in_watchlist']}
        else:
            # Add to watched list
            db.add(ListItem(list_id=watched_list.id, movie_id=movie_id))
            
            # Remove from watchlist if present
            if status['in_watchlist']:
                await db.execute(
                    delete(ListItem).where(
                        and_(
                            ListItem.list_id == watchlist.id,
                            ListItem.movie_id == movie_id
                        )
                    )
                )
            new_status = {'is_watched': True, 'in_watchlist': False}
        
        await db.commit()
        return new_status
    except Exception:
        await db.rollback()
        raise

async def toggle_watchlist_status(
    db: AsyncSession,
    user_id: UUID,
    movie_id: str
) -> Dict[str, bool]:
    """
    Toggle whether a movie is in a user's watchlist.
    
    Args:
        db: Database session
        user_id: UUID of the user
        movie_id: TMDB ID of the movie
    
    Returns:
        Dict[str, bool]: Dictionary with updated 'is_watched' and 'in_watchlist' status
    """
    watched_list, watchlist = await get_user_default_lists(db, user_id)
    
    # Get current status
    status = await get_movie_list_status(db, user_id, movie_id)
    
    try:
        if status['in_watchlist']:
            # Remove from watchlist
            await db.execute(
                delete(ListItem).where(
                    and_(
                        ListItem.list_id == watchlist.id,
                        ListItem.movie_id == movie_id
                    )
                )
            )
            new_status = {'is_watched': status['is_watched'], 'in_watchlist': False}
        else:
            # Add to watchlist if not already watched
            if not status['is_watched']:
                db.add(ListItem(list_id=watchlist.id, movie_id=movie_id))
                new_status = {'is_watched': False, 'in_watchlist': True}
            else:
                new_status = {'is_watched': True, 'in_watchlist': False}
        
        await db.commit()
        return new_status
    except Exception:
        await db.rollback()
        raise

async def add_movie_to_list(
    db: AsyncSession, 
    list_id: UUID, 
    movie_id: str, 
    notes: str = None
) -> ListItem:
    """
    Add a movie to a specified list.
    
    Args:
        db: Database session
        list_id: UUID of the target list
        movie_id: TMDB ID of the movie to add
        notes: Optional notes about the movie
    
    Returns:
        ListItem: Created list item object
    
    Notes:
        - Unique constraint prevents duplicate movies in the same list
        - Commits transaction immediately
        - List ownership should be verified before calling
    """
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
    """
    Retrieve or create the special "Watched" list for a user.
    
    Args:
        db: Database session
        user_id: UUID of the user
    
    Returns:
        List: The user's Watched list
    
    Notes:
        - Creates the list if it doesn't exist
        - Marked as a default list (is_default=True)
        - Used by the watched status toggle feature
        - Ensures exactly one Watched list per user
    """
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

async def get_or_create_watchlist(db: AsyncSession, user_id: UUID) -> List:
    """
    Retrieve or create the special "Watchlist" list for a user.
    
    Args:
        db: Database session
        user_id: UUID of the user
    
    Returns:
        List: The user's Watchlist
    
    Notes:
        - Creates the list if it doesn't exist
        - Marked as a default list (is_default=True)
        - Used by the watchlist toggle feature
        - Ensures exactly one Watchlist per user
    """
    query = select(List).where(
        (List.user_id == user_id) & (List.name == "Watchlist")
    )
    result = await db.execute(query)
    watchlist = result.scalar_one_or_none()
    
    if not watchlist:
        watchlist = List(
            user_id=user_id,
            name="Watchlist",
            description="Movies you want to watch",
            is_default=True
        )
        db.add(watchlist)
        await db.commit()
        await db.refresh(watchlist)
    
    return watchlist

async def get_list_by_id(db: AsyncSession, list_id: UUID) -> List:
    """
    Retrieve a single list by its ID.
    
    Args:
        db: Database session
        list_id: UUID of the list to retrieve
    
    Returns:
        List: The requested list with items eagerly loaded
    
    Notes:
        - Uses joinedload to prevent N+1 queries
        - List ownership should be verified before using the result
    """
    query = (
        select(List)
        .options(joinedload(List.items))
        .where(List.id == list_id)
    )
    result = await db.execute(query)
    return result.unique().scalar_one_or_none()

async def validate_list_name(db: AsyncSession, user_id: UUID, name: str, exclude_list_id: UUID = None) -> bool:
    """
    Check if a list name is available for a user.
    
    Args:
        db: Database session
        user_id: UUID of the user
        name: Name to validate
        exclude_list_id: Optional UUID of list to exclude from check (for updates)
    
    Returns:
        bool: True if name is available, False if already taken
    
    Notes:
        - Case-insensitive comparison
        - Excludes specified list ID for update operations
    """
    query = select(List).where(
        (List.user_id == user_id) & 
        (List.name.ilike(name))
    )
    
    if exclude_list_id:
        query = query.where(List.id != exclude_list_id)
    
    result = await db.execute(query)
    existing_list = result.scalar_one_or_none()
    return existing_list is None

async def update_list(
    db: AsyncSession, 
    list_id: UUID, 
    name: str = None, 
    description: str = None
) -> List:
    """
    Update a list's name and/or description.
    
    Args:
        db: Database session
        list_id: UUID of the list to update
        name: Optional new name for the list
        description: Optional new description for the list
    
    Returns:
        List: Updated list object
    
    Notes:
        - List ownership and name availability should be verified before calling
        - Only updates provided fields
        - Commits transaction immediately
    """
    list_obj = await get_list_by_id(db, list_id)
    if not list_obj:
        return None
        
    if name is not None:
        list_obj.name = name
    if description is not None:
        list_obj.description = description
        
    await db.commit()
    await db.refresh(list_obj)
    return list_obj

async def delete_list(db: AsyncSession, list_id: UUID) -> bool:
    """
    Delete a list and all its items.
    
    Args:
        db: Database session
        list_id: UUID of the list to delete
    
    Returns:
        bool: True if list was deleted, False if not found
    
    Notes:
        - List ownership should be verified before calling
        - Cannot delete default lists
        - Cascades deletion to list items
        - Commits transaction immediately
    """
    list_obj = await get_list_by_id(db, list_id)
    if not list_obj or list_obj.is_default:
        return False
        
    await db.delete(list_obj)
    await db.commit()
    return True 

async def get_user_lists(db: AsyncSession, user_id: UUID) -> TypeList[List]:
    """
    Retrieve all lists belonging to a user.
    
    Args:
        db: Database session
        user_id: UUID of the user whose lists to retrieve
    
    Returns:
        list[List]: Array of List objects with items eagerly loaded
    
    Notes:
        - Uses joinedload to prevent N+1 queries
        - Returns both default and custom lists
        - List items are eagerly loaded for efficiency
    """
    query = (
        select(List)
        .options(joinedload(List.items))
        .where(List.user_id == user_id)
    )
    result = await db.execute(query)
    return result.unique().scalars().all() 