from datetime import datetime
from uuid import uuid4
from sqlalchemy import Column, ForeignKey, String, Boolean, DateTime, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import relationship

from ..database.database import Base

class List(Base):
    __tablename__ = "lists"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(PostgresUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Use string reference to avoid circular import
    items = relationship("ListItem", back_populates="list", cascade="all, delete-orphan")
    user = relationship("User", back_populates="lists")

class ListItem(Base):
    __tablename__ = "list_items"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    list_id = Column(PostgresUUID(as_uuid=True), ForeignKey("lists.id"), nullable=False)
    movie_id = Column(String(255), nullable=False)
    added_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    notes = Column(Text, nullable=True)

    list = relationship("List", back_populates="items")

    __table_args__ = (
        UniqueConstraint('list_id', 'movie_id', name='uix_list_movie'),
    ) 