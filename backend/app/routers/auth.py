"""
Authentication Router

This module handles all authentication-related endpoints including user signup, login, and profile retrieval.
It implements secure password hashing, JWT token generation, and user session management.

Features:
- User registration with email validation
- Secure password hashing using bcrypt
- JWT-based authentication
- User session tracking with last login timestamp
- Protected route for retrieving user profile
"""

from datetime import datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database.database import get_db
from ..models.user import User
from ..schemas.user import UserCreate, UserResponse
from ..schemas.token import Token
from ..utils.auth import (
    get_password_hash,
    create_access_token,
    get_current_user,
    authenticate_user
)

router = APIRouter()

@router.post("/signup", response_model=UserResponse)
async def signup(user: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Register a new user account.
    
    Args:
        user: UserCreate schema containing email and password
        db: Database session dependency
    
    Returns:
        UserSchema: Created user information
        
    Raises:
        HTTPException: If email is already registered
    """
    # Check if user exists
    query = select(User).where(User.email == user.email)
    result = await db.execute(query)
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    hashed_password = get_password_hash(user.password) if user.password else None
    db_user = User(
        email=user.email,
        username=user.email.split('@')[0],  # Use email prefix as username
        hashed_password=hashed_password,
        is_active=True
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=Token)
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: AsyncSession = Depends(get_db)):
    """
    Authenticate a user and create a new session.
    
    Args:
        form_data: OAuth2 form containing username and password
        db: Database session dependency
    
    Returns:
        Token: Contains access token and token type
        
    Raises:
        HTTPException: If credentials are invalid
    """
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
    return {"access_token": access_token, "token_type": "bearer", "username": user.email}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    """
    Retrieve the current authenticated user's profile.
    
    Args:
        current_user: User object from the JWT token dependency
    
    Returns:
        UserSchema: Current user's profile information
    """
    return current_user 