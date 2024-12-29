"""
Authentication Router

This module handles all authentication-related endpoints including user signup, login, and profile retrieval.
It implements secure password hashing, JWT token generation, and user session management.

Features:
- User registration with email and username validation
- Secure password hashing using bcrypt
- JWT-based authentication
- User session tracking with last login timestamp
- Automatic creation of default user lists on signup
- Protected route for retrieving user profile
"""

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
    """
    Register a new user account.
    
    Args:
        user: UserCreate schema containing email, username, and password
        db: Database session dependency
    
    Returns:
        UserSchema: Created user information
        
    Raises:
        HTTPException: If email or username is already registered
    
    Notes:
        - Automatically creates default movie lists for new users
        - Passwords are hashed before storage
        - New accounts are set as active but not superuser by default
    """
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
    """
    Authenticate a user and create a new session.
    
    Args:
        form_data: OAuth2 form containing username and password
        db: Database session dependency
    
    Returns:
        dict: Contains access token and token type
        
    Raises:
        HTTPException: If credentials are invalid
    
    Notes:
        - Updates user's last_login timestamp
        - Returns JWT token for subsequent authenticated requests
        - Token contains user's email as the subject claim
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
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserSchema)
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    """
    Retrieve the current authenticated user's profile.
    
    Args:
        current_user: User object from the JWT token dependency
    
    Returns:
        UserSchema: Current user's profile information
    
    Notes:
        - Requires valid JWT token in Authorization header
        - Used for verifying authentication and getting user details
    """
    return current_user 