from app.models.models import User
from app.schemas.schemas import UserCreate
from app.core.security import hash_password
from bson import ObjectId


async def get_user_by_id(user_id: str) -> User | None:
    return await User.get(ObjectId(user_id))


async def get_user_by_email(email: str) -> User | None:
    return await User.find_one(User.email == email.lower())


async def get_user_by_username(username: str) -> User | None:
    return await User.find_one(User.username == username)


async def create_user(user_data: UserCreate) -> User:
    user = User(
        email=user_data.email.lower(),
        username=user_data.username,
        hashed_password=hash_password(user_data.password),
    )
    await user.insert()
    return user


async def update_username(user_id: str, new_username: str) -> User | None:
    user = await User.get(ObjectId(user_id))
    if not user:
        return None
    user.username = new_username
    await user.save()
    return user
