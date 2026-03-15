from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth_router, tasks_router, templates_router
from app.config import settings

# Import models so Alembic/SQLAlchemy can discover them
import app.models.models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables (dev only — use Alembic in production)
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: dispose connection pool cleanly
    engine.dispose()


app = FastAPI(
    title="TaskFlow API",
    description="A scalable multi-user To-Do List API with templates",
    version="1.0.0",
    # Disable interactive docs in production for security
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(templates_router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "TaskFlow API is running"}
