"""
Authentication Utilities

This module provides core authentication and authorization functionality for the application.
It handles password hashing, JWT token management, and user authentication.

Key Features:
- Secure password hashing using bcrypt
- JWT token generation and validation
- User authentication and verification
- FastAPI OAuth2 integration
- Environment-based configuration

Security Notes:
- Uses industry-standard bcrypt for password hashing
- Implements JWT with configurable expiration
- Provides dependency injection for protected routes
- Handles token validation and user verification
"""

from datetime import datetime, timedelta
from typing import Optional, Annotated
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import os
from dotenv import load_dotenv
from uuid import UUID

from ..database.database import get_db
from ..models.user import User

load_dotenv()

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Get JWT secret key from environment variable or use a default for development
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-for-development")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain text password against its hash.
    
    Args:
        plain_password: The plain text password to verify
        hashed_password: The bcrypt hash to check against
    
    Returns:
        bool: True if password matches, False otherwise
    
    Notes:
        - Uses bcrypt's built-in verification
        - Timing-attack safe comparison
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Generate a secure hash of a password.
    
    Args:
        password: Plain text password to hash
    
    Returns:
        str: Bcrypt hash of the password
    
    Notes:
        - Uses bcrypt with automatic salt generation
        - Configurable work factor for future security adjustment
    """
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a new JWT access token.
    
    Args:
        data: Dictionary of claims to include in the token
        expires_delta: Optional custom expiration time
    
    Returns:
        str: Encoded JWT token
    
    Notes:
        - Uses environment-configured secret key
        - Default expiration of 30 minutes
        - Includes standard JWT expiration claim
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> dict:
    """
    Verify and decode a JWT token.
    
    Args:
        token: JWT token to verify
    
    Returns:
        dict: Decoded token payload
    
    Raises:
        HTTPException: If token is invalid or expired
    
    Notes:
        - Verifies signature using configured secret
        - Checks token expiration
        - Returns decoded payload for valid tokens
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) 

async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    FastAPI dependency for getting the current authenticated user.
    
    Args:
        token: JWT token from request (injected by FastAPI)
        db: Database session (injected by FastAPI)
    
    Returns:
        User: Current authenticated user
    
    Raises:
        HTTPException: If token is invalid or user not found
    
    Notes:
        - Used as a dependency in protected routes
        - Verifies token and retrieves user in one step
        - Includes proper WWW-Authenticate header
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    query = select(User).where(User.email == email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
        
    return user

async def authenticate_user(username: str, password: str, db: AsyncSession) -> Optional[User]:
    """
    Authenticate a user by username/email and password.
    
    Args:
        username: User's email address
        password: Plain text password to verify
        db: Database session
    
    Returns:
        Optional[User]: User object if authenticated, None otherwise
    
    Notes:
        - Uses email as username for authentication
        - Verifies password against stored hash
        - Returns None for any authentication failure
        - Does not distinguish between invalid user and password
    """
    query = select(User).where(User.email == username)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
        
    return user 