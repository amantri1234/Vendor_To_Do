from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.pool import QueuePool
from app.config import settings


engine = create_engine(
    settings.DATABASE_URL,
    poolclass=QueuePool,
    pool_pre_ping=True,       # drop stale connections automatically
    pool_size=10,             # persistent connections kept alive
    max_overflow=20,          # extra connections under burst load
    pool_recycle=1800,        # recycle connections every 30 min (prevents MySQL 8h timeout)
    pool_timeout=30,          # raise after 30s if no connection available
    echo=settings.DEBUG,      # log SQL only in debug mode
)


class Base(DeclarativeBase):
    pass


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,   # avoid extra SELECT after commit
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
