from fastapi import APIRouter, Depends, HTTPException, status, Request
from app.core.security import get_current_user, verify_password, hash_password
from app.models.models import User
from app.schemas.schemas import UserOut
from app.crud.user_crud import get_user_by_username, update_username
from app.core.rate_limit import limiter
from pydantic import BaseModel, field_validator
from typing import Optional


router = APIRouter(prefix="/users", tags=["Users"])


class UpdateProfile(BaseModel):
    username: Optional[str] = None

    @field_validator("username")
    @classmethod
    def username_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if len(v) < 3:
                raise ValueError("Username must be at least 3 characters")
            if len(v) > 100:
                raise ValueError("Username must be 100 characters or fewer")
        return v


class ChangePassword(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def strong_password(cls, v: str) -> str:
        import re
        if len(v) < 12:
            raise ValueError("Password must be at least 12 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain an uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain a lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain a digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-]", v):
            raise ValueError("Password must contain a special character")
        return v


@router.get("/me", response_model=UserOut)
async def get_profile(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user.model_dump())


@router.put("/me", response_model=UserOut)
async def update_profile(
    data: UpdateProfile,
    current_user: User = Depends(get_current_user),
):
    if data.username and data.username != current_user.username:
        existing = await get_user_by_username(data.username)
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
        updated = await update_username(str(current_user.id), data.username)
        if not updated:
            raise HTTPException(status_code=500, detail="Failed to update profile")
        return UserOut.model_validate(updated.model_dump())
    return UserOut.model_validate(current_user.model_dump())


@router.put("/change-password", status_code=status.HTTP_200_OK)
@limiter.limit("3/minute")
async def change_password(
    request: Request,
    data: ChangePassword,
    current_user: User = Depends(get_current_user),
):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.hashed_password = hash_password(data.new_password)
    await current_user.save()
    return {"message": "Password changed successfully"}
