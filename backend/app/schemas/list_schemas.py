"""
List Schemas

This module defines Pydantic models for movie list data validation and serialization.
It provides schemas for both movie lists and their items (individual movie entries).

Schema Hierarchy:
List-related:
- ListBase: Common list fields (name, description)
- ListCreate: Used for list creation
- List: Complete list representation with items

List Item-related:
- ListItemBase: Common item fields (movie_id, notes)
- ListItemCreate: Used for adding movies to lists
- ListItem: Complete list item representation

Features:
- Nested schema relationships
- Optional fields with proper typing
- ORM mode support for SQLAlchemy integration
- Default empty lists for new collections
"""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel

class ListItemBase(BaseModel):
    """
    Base schema for list items (movies in lists).
    
    This schema defines the basic fields needed to identify a movie
    and store user notes about it.
    
    Attributes:
        movie_id (str): TMDB ID of the movie
        notes (str, optional): User's notes about the movie
    """
    movie_id: str
    notes: Optional[str] = None

class ListItemCreate(ListItemBase):
    """
    Schema for adding a movie to a list.
    
    This schema is used when adding new movies to a list.
    It inherits all fields from ListItemBase without modification.
    """
    pass

class ListItem(ListItemBase):
    """
    Complete list item representation for API responses.
    
    This schema includes all fields related to a movie entry in a list,
    including system-generated fields.
    
    Attributes:
        id (UUID): Unique identifier for the list item
        list_id (UUID): ID of the parent list
        added_at (datetime): When the movie was added to the list
    """
    id: UUID
    list_id: UUID
    added_at: datetime

    class Config:
        from_attributes = True

class ListBase(BaseModel):
    """
    Base schema for movie lists.
    
    This schema defines the basic fields that users can set when
    creating or updating a list.
    
    Attributes:
        name (str): Name of the list
        description (str, optional): Description of the list's purpose
    """
    name: str
    description: Optional[str] = None

class ListCreate(ListBase):
    """
    Schema for creating new movie lists.
    
    This schema is used when users create new lists.
    It inherits all fields from ListBase without modification.
    """
    pass

class ListUpdate(BaseModel):
    """
    Schema for updating existing movie lists.
    
    This schema defines the fields that can be updated for an existing list.
    All fields are optional since updates may modify only some fields.
    
    Attributes:
        name (str, optional): New name for the list
        description (str, optional): New description for the list
    """
    name: Optional[str] = None
    description: Optional[str] = None

class List(ListBase):
    """
    Complete list representation for API responses.
    
    This schema includes all fields related to a movie list,
    including system-generated fields and nested items.
    
    Attributes:
        id (UUID): Unique identifier for the list
        user_id (UUID): ID of the list owner
        is_default (bool): Whether this is a system-generated list
        created_at (datetime): When the list was created
        updated_at (datetime): When the list was last modified
        items (List[ListItem]): Collection of movies in the list
    """
    id: UUID
    user_id: UUID
    is_default: bool
    created_at: datetime
    updated_at: datetime
    items: List[ListItem] = []

    class Config:
        from_attributes = True 