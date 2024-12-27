from datetime import datetime
from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database.database import get_db
from ..models.user import User
from ..schemas.user import UserCreate, User as UserSchema
from ..services.list_service import create_default_lists
from ..utils.auth import (
    get_password_hash,
    create_access_token,
    get_current_user,
    authenticate_user
)

router = APIRouter()

@router.post("/signup", response_model=UserSchema)
async def signup(user: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    query = select(User).where(
        (User.email == user.email) | (User.username == user.username)
    )
    result = await db.execute(query)
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )

    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        is_active=True,
        is_superuser=False
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    # Create default lists for new user
    await create_default_lists(db, db_user)
    
    return db_user

@router.post("/login")
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last_login
    user.last_login = datetime.utcnow()
    await db.commit()
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserSchema)
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user 