from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import get_current_user, hash_password
from app.models.models import User
from app.schemas.schemas import UserOut
from app.crud.user_crud import get_user_by_username
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/users", tags=["Users"])


class UpdateProfile(BaseModel):
    username: Optional[str] = None


class ChangePassword(BaseModel):
    current_password: str
    new_password: str


@router.get("/me", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserOut)
def update_profile(
    data: UpdateProfile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.username and data.username != current_user.username:
        if get_user_by_username(db, data.username):
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = data.username
    db.commit()
    return current_user
