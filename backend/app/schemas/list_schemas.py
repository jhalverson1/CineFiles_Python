from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel

class ListItemBase(BaseModel):
    movie_id: str
    notes: Optional[str] = None

class ListItemCreate(ListItemBase):
    pass

class ListItem(ListItemBase):
    id: UUID
    list_id: UUID
    added_at: datetime

    class Config:
        from_attributes = True

class ListBase(BaseModel):
    name: str
    description: Optional[str] = None

class ListCreate(ListBase):
    pass

class List(ListBase):
    id: UUID
    user_id: UUID
    is_default: bool
    created_at: datetime
    updated_at: datetime
    items: List[ListItem] = []

    class Config:
        from_attributes = True 