from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional
from app.core.security import create_access_token
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.schemas.token import Token
from app.services import user_service
from app.schemas.auth import GoogleAuthRequest

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = user_service.authenticate_user(
        db, form_data.username, form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/signup", response_model=UserResponse)
async def signup(
    user_create: UserCreate,
    db: Session = Depends(get_db)
):
    # Check if user already exists
    db_user = user_service.get_user_by_email(db, email=user_create.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create new user
    user = user_service.create_user(db=db, user_create=user_create)
    return user

@router.post("/google", response_model=Token)
async def google_auth(
    auth_request: GoogleAuthRequest,
    db: Session = Depends(get_db)
):
    """
    Handle Google authentication. This endpoint will:
    1. Check if user exists by email
    2. If not, create a new user with just the email
    3. Return a JWT token
    """
    # Check if user exists
    user = user_service.get_user_by_email(db, email=auth_request.email)
    
    if not user:
        # Create new user with just email
        user_create = UserCreate(
            email=auth_request.email,
            password=None  # No password for Google-authenticated users
        )
        user = user_service.create_user(db=db, user_create=user_create)
    
    # Create access token
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "username": user.email} 