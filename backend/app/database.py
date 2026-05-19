from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.config import settings

client: AsyncIOMotorClient | None = None


async def init_db():
    global client
    client = AsyncIOMotorClient(
        settings.MONGODB_URL,
        maxPoolSize=50,
        minPoolSize=5,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=5000,
    )
    # Verify connection
    try:
        await client.admin.command("ping")
    except Exception:
        raise ConnectionError("Could not connect to MongoDB")

    from app.models.models import User, Task, Template, FailedLoginAttempt

    await init_beanie(
        database=client[settings.MONGODB_DB_NAME],
        document_models=[User, Task, Template, FailedLoginAttempt],
    )


async def close_db():
    global client
    if client:
        client.close()
        client = None
