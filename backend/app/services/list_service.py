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
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.list_models import List, ListItem
from ..models.user import User

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

async def create_default_lists(db: AsyncSession, user: User) -> None:
    """
    Create the default set of lists for a new user.
    
    Args:
        db: Database session
        user: User object to create lists for
    
    Notes:
        - Creates "Watched" and "Watchlist" by default
        - Lists are marked as is_default=True
        - Called automatically during user registration
        - Commits all lists in a single transaction
    """
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

async def toggle_watched_status(db: AsyncSession, user_id: UUID, movie_id: str) -> bool:
    """
    Toggle whether a movie is marked as watched by a user.
    
    Args:
        db: Database session
        user_id: UUID of the user
        movie_id: TMDB ID of the movie
    
    Returns:
        bool: New watched status (True if watched, False if unwatched)
    
    Notes:
        - Automatically creates Watched list if needed
        - Removes movie if already watched
        - Adds movie if not watched
        - When marking as watched, removes from watchlist if present
        - Returns new status for UI updates
    """
    watched_list = await get_or_create_watched_list(db, user_id)
    
    # Check if movie is already in the watched list
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
        
        # Remove from watchlist if present
        watchlist = await get_or_create_watchlist(db, user_id)
        watchlist_query = select(ListItem).where(
            (ListItem.list_id == watchlist.id) & 
            (ListItem.movie_id == movie_id)
        )
        watchlist_result = await db.execute(watchlist_query)
        watchlist_item = watchlist_result.scalar_one_or_none()
        
        if watchlist_item:
            await db.delete(watchlist_item)
        
        await db.commit()
        return True

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

async def toggle_watchlist_status(db: AsyncSession, user_id: UUID, movie_id: str) -> bool:
    """
    Toggle whether a movie is in a user's watchlist.
    
    Args:
        db: Database session
        user_id: UUID of the user
        movie_id: TMDB ID of the movie
    
    Returns:
        bool: New watchlist status (True if in watchlist, False if not)
    
    Notes:
        - Automatically creates Watchlist if needed
        - Removes movie if already in watchlist
        - Adds movie if not in watchlist
        - Returns new status for UI updates
    """
    watchlist = await get_or_create_watchlist(db, user_id)
    
    # Check if movie is already in the list
    query = select(ListItem).where(
        (ListItem.list_id == watchlist.id) & 
        (ListItem.movie_id == movie_id)
    )
    result = await db.execute(query)
    list_item = result.scalar_one_or_none()
    
    if list_item:
        # Remove from watchlist
        await db.delete(list_item)
        await db.commit()
        return False
    else:
        # Add to watchlist
        list_item = ListItem(
            list_id=watchlist.id,
            movie_id=movie_id
        )
        db.add(list_item)
        await db.commit()
        return True 

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