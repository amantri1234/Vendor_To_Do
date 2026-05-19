from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from app.schemas.schemas import UserCreate, UserLogin, Token, UserOut
from app.crud.user_crud import get_user_by_email, get_user_by_username, create_user
from app.core.security import verify_password, create_access_token, decode_access_token, get_current_user
from app.core.rate_limit import limiter
from app.models.models import FailedLoginAttempt, TokenBlacklist, User
from datetime import datetime, timedelta, timezone

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

router = APIRouter(prefix="/auth", tags=["Authentication"])

MAX_FAILED_ATTEMPTS = 10
LOCKOUT_MINUTES = 15


def _is_locked(record):
    if not record or not record.locked_until:
        return False
    locked = record.locked_until
    now = datetime.now(timezone.utc)
    if locked.tzinfo is None:
        locked = locked.replace(tzinfo=timezone.utc)
    return locked > now


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/minute")
async def register(request: Request, user_data: UserCreate):
    existing_email = await get_user_by_email(user_data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed. Please check your details and try again.",
        )
    existing_username = await get_user_by_username(user_data.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed. Please check your details and try again.",
        )
    user = await create_user(user_data)
    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token, token_type="bearer", user=UserOut.model_validate(user.model_dump()))


@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login(request: Request, credentials: UserLogin):
    record = await FailedLoginAttempt.find_one(FailedLoginAttempt.email == credentials.email.lower())
    if _is_locked(record):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Account is temporarily locked due to too many failed attempts. Try again later.",
        )

    user = await get_user_by_email(credentials.email)

    # Timing-safe check: always verify password, even if user doesn't exist
    password_valid = verify_password(
        credentials.password,
        user.hashed_password if user else "$2b$12$VwS2q28AZ4LenO488.PT9OFPK.9GwEWuTsccgMZYqGxQCHrT6jcDK",
    )

    if not user or not password_valid:
        await _record_failed_attempt(credentials.email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    await _clear_failed_attempts(credentials.email)
    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token, token_type="bearer", user=UserOut.model_validate(user.model_dump()))


async def _record_failed_attempt(email: str):
    record = await FailedLoginAttempt.find_one(FailedLoginAttempt.email == email.lower())
    now = datetime.now(timezone.utc)
    if record:
        record.attempt_count += 1
        if record.attempt_count >= MAX_FAILED_ATTEMPTS:
            record.locked_until = now + timedelta(minutes=LOCKOUT_MINUTES)
        await record.save()
    else:
        await FailedLoginAttempt(email=email.lower(), locked_until=None).insert()


async def _clear_failed_attempts(email: str):
    await FailedLoginAttempt.find(FailedLoginAttempt.email == email.lower()).delete()


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(token: str = Depends(oauth2_scheme), current_user: User = Depends(get_current_user)):
    payload = decode_access_token(token)
    if payload and payload.get("jti"):
        expires_at = datetime.fromtimestamp(payload["exp"], tz=timezone.utc) if payload.get("exp") else datetime.now(timezone.utc)
        existing = await TokenBlacklist.find_one(TokenBlacklist.token_jti == payload["jti"])
        if not existing:
            await TokenBlacklist(
                token_jti=payload["jti"],
                expires_at=expires_at,
            ).insert()
    return {"message": "Logged out successfully"}
