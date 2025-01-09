"""
Authentication Router

This module handles all authentication-related endpoints including user signup, login, and profile retrieval.
It implements secure password hashing, JWT token generation, and user session management.

Features:
- User registration with email validation
- Secure password hashing using bcrypt
- JWT-based authentication with refresh tokens
- User session tracking with last login timestamp
- Protected route for retrieving user profile
"""

from datetime import datetime
import logging
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Form, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database.database import get_db
from ..models.user import User
from ..schemas.user import UserCreate, UserResponse
from ..schemas.token import Token
from ..core.security import (
    get_password_hash,
    create_access_token,
    create_refresh_token,
    get_current_user,
    authenticate_user,
    verify_token,
    REFRESH_SECRET_KEY
)

router = APIRouter()
logger = logging.getLogger(__name__)

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
        Token: Contains access token, refresh token and token type
        
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
    
    # Create both tokens
    token_data = {"sub": user.email}
    access_token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data=token_data)
    
    # Return both tokens
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        username=user.email
    )

@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str = Form(...), db: AsyncSession = Depends(get_db)):
    """
    Create a new access token using a refresh token.
    
    Args:
        refresh_token: Valid refresh token
        db: Database session dependency
    
    Returns:
        Token: New access token and refresh token
        
    Raises:
        HTTPException: If refresh token is invalid
    """
    logger.info("[Token Refresh] Starting token refresh process")
    try:
        logger.info("[Token Refresh] Verifying refresh token")
        payload = verify_token(refresh_token, REFRESH_SECRET_KEY, "refresh")
        email = payload.get("sub")
        if not email:
            logger.error("[Token Refresh] Invalid refresh token - no email in payload")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        # Verify user still exists
        logger.info(f"[Token Refresh] Verifying user exists for email: {email}")
        query = select(User).where(User.email == email)
        result = await db.execute(query)
        user = result.scalar_one_or_none()
        
        if not user:
            logger.error(f"[Token Refresh] User not found for email: {email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        # Create new tokens
        logger.info(f"[Token Refresh] Creating new tokens for user: {email}")
        token_data = {"sub": email}
        new_access_token = create_access_token(data=token_data)
        new_refresh_token = create_refresh_token(data=token_data)
        
        logger.info("[Token Refresh] Successfully created new tokens")
        # Return both tokens
        return Token(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            username=email
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Token Refresh] Unexpected error during token refresh: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

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

@router.get("/test-auth", response_model=dict)
async def test_auth(current_user: Annotated[User, Depends(get_current_user)]):
    """
    Test endpoint to verify authentication and token refresh.
    Returns timestamp to verify the request was successful.
    """
    return {
        "message": "Authentication successful",
        "timestamp": datetime.utcnow().isoformat(),
        "user_email": current_user.email
    } 

@router.get("/test-auth-expiry")
async def test_auth_expiry(request: Request, current_user: Annotated[User, Depends(get_current_user)]):
    """
    Test endpoint that simulates token expiration by validating with a shorter expiry time.
    Only forces expiry on the first attempt, allows retry with refreshed token.
    """
    logger.info("[Test Auth Expiry] Starting token expiry test")
    
    # Force token validation with a very short expiry time
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        logger.error("[Test Auth Expiry] No valid authorization header found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = auth_header.split(' ')[1]
    
    # Check if this is a retry attempt by looking at the token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        is_retry = payload.get("iat", 0) > datetime.utcnow().timestamp() - 5  # Token issued in last 5 seconds
        
        if is_retry:
            logger.info("[Test Auth Expiry] Detected retry with fresh token, allowing request")
            return {
                "message": "Authentication successful (retry)",
                "timestamp": datetime.utcnow().isoformat(),
                "user_email": current_user.email
            }
            
        # Force expiry for first attempt
        logger.info("[Test Auth Expiry] First attempt, forcing token expiry")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    except Exception as e:
        logger.error(f"[Test Auth Expiry] Token verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
            headers={"WWW-Authenticate": "Bearer"},
        ) 