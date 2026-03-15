from sqlalchemy.orm import Session
from app.models.models import User
from app.schemas.schemas import UserCreate
from app.core.security import hash_password


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> User | None:
    # email is indexed — fast lookup
    return db.query(User).filter(User.email == email.lower()).first()


def get_user_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(User.username == username).first()


def create_user(db: Session, user_data: UserCreate) -> User:
    db_user = User(
        email=user_data.email.lower(),   # normalise email to lowercase
        username=user_data.username,
        hashed_password=hash_password(user_data.password),
    )
    db.add(db_user)
    db.commit()
    return db_user
