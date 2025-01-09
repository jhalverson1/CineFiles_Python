"""
Security Module

This module provides core security functionality for the application.
It handles JWT token generation and password hashing.

Features:
- JWT token generation and validation
- Password hashing with bcrypt
- Configurable token expiration
- Refresh token support
"""

from datetime import datetime, timedelta
from typing import Optional, Annotated
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import os
from dotenv import load_dotenv
import logging

from ..database.database import get_db
from ..models.user import User

load_dotenv()

logger = logging.getLogger(__name__)

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# JWT configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-for-development")
REFRESH_SECRET_KEY = os.getenv("JWT_REFRESH_SECRET_KEY", "your-refresh-secret-key-for-development")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 0.5  # 30 seconds
REFRESH_TOKEN_EXPIRE_DAYS = 0.000694444  # 1 minute (1/1440 of a day)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    
    Args:
        plain_password: Password to verify
        hashed_password: Hash to check against
        
    Returns:
        bool: True if password matches
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Hash a password.
    
    Args:
        password: Password to hash
        
    Returns:
        str: Hashed password
    """
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Claims to include in the token
        expires_delta: Optional custom expiration time
        
    Returns:
        str: Encoded JWT token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "token_type": "access"
    })
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    """
    Create a JWT refresh token.
    
    Args:
        data: Claims to include in the token
    
    Returns:
        str: Encoded JWT refresh token
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "token_type": "refresh"
    })
    encoded_jwt = jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str, secret_key: str = SECRET_KEY, verify_type: str = "access", force_expiry_seconds: int = None) -> dict:
    """
    Verify and decode a JWT token.
    
    Args:
        token: JWT token to verify
        secret_key: Secret key to use for verification
        verify_type: Type of token to verify ("access" or "refresh")
        force_expiry_seconds: If set, force token to expire after this many seconds
    
    Returns:
        dict: Decoded token payload
    
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        logger.info(f"[Token Verify] Verifying {verify_type} token")
        payload = jwt.decode(token, secret_key, algorithms=[ALGORITHM])
        logger.info(f"[Token Verify] Token payload: {payload}")
        
        if payload.get("token_type") != verify_type:
            logger.error(f"[Token Verify] Invalid token type. Expected {verify_type}, got {payload.get('token_type')}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token type. Expected {verify_type}",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        # If force_expiry_seconds is set, always trigger a token expiry
        if force_expiry_seconds is not None:
            logger.info(f"[Token Verify] Forcing token expiry for testing")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expired (forced expiry for testing)",
                headers={"WWW-Authenticate": "Bearer"},
            )
                
        return payload
    except jwt.ExpiredSignatureError:
        logger.error(f"[Token Verify] Token has expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError as e:
        logger.error(f"[Token Verify] JWT verification failed: {str(e)}")
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
    """
    logger.info("[Auth] Validating access token")
    
    try:
        # First try to decode without verification to log the token contents
        try:
            unverified_payload = jwt.decode(token, options={"verify_signature": False})
            logger.info(f"[Auth] Token claims: exp={unverified_payload.get('exp')}, iat={unverified_payload.get('iat')}, type={unverified_payload.get('token_type')}")
        except Exception as e:
            logger.error(f"[Auth] Could not decode token for logging: {str(e)}")
        
        # Now do the actual verification
        payload = verify_token(token, SECRET_KEY, "access")
        email: str = payload.get("sub")
        if email is None:
            logger.error("[Auth] No email found in token payload")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token claims",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        logger.info(f"[Auth] Token validated successfully for user: {email}")
        
        # Verify user exists
        query = select(User).where(User.email == email)
        result = await db.execute(query)
        user = result.scalar_one_or_none()
        
        if user is None:
            logger.error(f"[Auth] User not found for email: {email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        return user
        
    except jwt.ExpiredSignatureError as e:
        logger.error(f"[Auth] Token has expired: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError as e:
        logger.error(f"[Auth] JWT validation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"[Auth] Unexpected error during authentication: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def authenticate_user(email: str, password: str, db: AsyncSession) -> Optional[User]:
    """
    Authenticate a user with email and password.
    
    Args:
        email: User's email
        password: User's password
        db: Database session
    
    Returns:
        Optional[User]: Authenticated user or None if authentication fails
    """
    query = select(User).where(User.email == email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(password, user.hashed_password):
        return None
        
    return user 