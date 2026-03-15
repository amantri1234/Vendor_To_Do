from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/todoapp"
    SECRET_KEY: str = "changeme-super-secret-key-at-least-32-characters"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DEBUG: bool = True
    # Comma-separated list of allowed CORS origins
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    class Config:
        env_file = ".env"
        # Allow parsing comma-separated list from env
        env_parse_none_str = "None"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
