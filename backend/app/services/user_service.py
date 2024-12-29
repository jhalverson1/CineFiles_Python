from sqlalchemy.orm import Session
from typing import Optional
from ..core.security import get_password_hash, verify_password
from ..models.user import User
from ..schemas.user import UserCreate

def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def get_user_by_google_id(db: Session, google_id: str) -> Optional[User]:
    return db.query(User).filter(User.google_id == google_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user_create: UserCreate) -> User:
    hashed_password = get_password_hash(user_create.password) if user_create.password else None
    db_user = User(
        email=user_create.email,
        full_name=user_create.full_name,
        hashed_password=hashed_password,
        google_id=getattr(user_create, 'google_id', None),
        photo_url=getattr(user_create, 'photo_url', None)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email=email)
    if not user or not user.hashed_password:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def update_user_google_info(db: Session, user: User, google_id: str, photo_url: Optional[str] = None) -> User:
    user.google_id = google_id
    if photo_url:
        user.photo_url = photo_url
    db.commit()
    db.refresh(user)
    return user 