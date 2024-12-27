from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy import Column, ForeignKey, String, Boolean, DateTime, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import relationship
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import func
from typing import Optional

from ..database.database import Base

class List(Base):
    __tablename__ = "lists"

    id: Mapped[UUID] = mapped_column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(PostgresUUID(as_uuid=True), ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Use string reference to avoid circular import
    items: Mapped[list["ListItem"]] = relationship("ListItem", back_populates="list", lazy="selectin")
    user = relationship("User", back_populates="lists")

class ListItem(Base):
    __tablename__ = "list_items"

    id: Mapped[UUID] = mapped_column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    list_id: Mapped[UUID] = mapped_column(PostgresUUID(as_uuid=True), ForeignKey("lists.id"))
    movie_id: Mapped[str] = mapped_column(String(255))
    added_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    list: Mapped["List"] = relationship("List", back_populates="items")

    __table_args__ = (
        UniqueConstraint('list_id', 'movie_id', name='uix_list_movie'),
    ) 