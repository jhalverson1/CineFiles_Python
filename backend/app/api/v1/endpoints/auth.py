from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.core.security import create_access_token
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.schemas.token import Token
from app.services import user_service
from app.utils.auth import get_current_user

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """Login endpoint that authenticates user credentials and returns a JWT token"""
    try:
        user = await user_service.authenticate_user(db, form_data.username, form_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer", "username": user.email}
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/signup", response_model=UserResponse)
async def signup(
    user_create: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Signup endpoint that creates a new user account"""
    try:
        # Check if user already exists
        db_user = await user_service.get_user_by_email(db, email=user_create.email)
        if db_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )
        
        # Create new user
        user = await user_service.create_user(db=db, user_create=user_create)
        return user
    except Exception as e:
        print(f"Signup error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/verify")
async def verify_token(current_user: User = Depends(get_current_user)):
    """
    Verify if the current token is valid by attempting to get the current user.
    If the token is invalid, get_current_user dependency will raise an HTTPException.
    """
    return {
        "status": "valid",
        "user": {
            "id": str(current_user.id),
            "email": current_user.email,
            "username": current_user.username
        }
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user 