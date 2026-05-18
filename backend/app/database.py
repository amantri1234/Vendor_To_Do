from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.pool import QueuePool, NullPool
from app.config import settings

_is_sqlite = settings.DATABASE_URL.startswith("sqlite")
_engine_kwargs = dict(
    echo=settings.DEBUG,
    connect_args={"check_same_thread": False} if _is_sqlite else {},
)
if _is_sqlite:
    _engine_kwargs["poolclass"] = NullPool
else:
    _engine_kwargs["poolclass"] = QueuePool
    _engine_kwargs.update(
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        pool_recycle=1800,
        pool_timeout=30,
    )

engine = create_engine(settings.DATABASE_URL, **_engine_kwargs)


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
