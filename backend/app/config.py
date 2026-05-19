from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "taskflow"

    # Auth
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Security
    DEBUG: bool = False
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_LOGIN: str = "5/minute"
    RATE_LIMIT_REGISTER: str = "3/minute"
    RATE_LIMIT_GLOBAL: str = "200/hour"

    class Config:
        env_file = ".env"
        env_parse_none_str = "None"

    def log_config(self):
        import logging
        logger = logging.getLogger("taskflow")
        host = self.MONGODB_URL.split("@")[-1] if "@" in self.MONGODB_URL else self.MONGODB_URL
        logger.info(f"MongoDB host: {host}")
        logger.info(f"MongoDB database: {self.MONGODB_DB_NAME}")
        logger.info(f"DEBUG mode: {self.DEBUG}")


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
