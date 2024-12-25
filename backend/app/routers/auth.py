from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_

from ..database.database import get_db
from ..models.user import User
from ..schemas.user import UserCreate, UserLogin, User as UserSchema
from ..utils.auth import verify_password, get_password_hash, create_access_token

router = APIRouter()

@router.post("/signup", response_model=UserSchema)
async def signup(user: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user with same email or username exists
    query = select(User).where(
        or_(User.email == user.email, User.username == user.username)
    )
    result = await db.execute(query)
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )
    
    # Create new user
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=get_password_hash(user.password),
        is_active=True,
        is_superuser=False
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    return db_user

@router.post("/login")
async def login(user_credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    # Find user by email
    query = select(User).where(User.email == user_credentials.email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.email, "id": user.id}
    )
    
    return {"access_token": access_token, "token_type": "bearer"} 