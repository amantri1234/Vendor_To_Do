from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware
from app.database import init_db, close_db
from app.routers import auth_router, tasks_router, templates_router, users_router
from app.config import settings
from app.core.rate_limit import limiter
from app.core.middleware import SecurityHeadersMiddleware, LogSanitizationMiddleware
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("taskflow")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    logger.info("MongoDB connected successfully")
    settings.log_config()
    yield
    await close_db()
    logger.info("MongoDB connection closed")


app = FastAPI(
    title="TaskFlow API",
    description="A scalable multi-user To-Do List API with MongoDB",
    version="2.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# ── Rate Limiter ──────────────────────────────────────────────────────────────────
app.state.limiter = limiter


async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please slow down."},
    )


app.add_exception_handler(RateLimitExceeded, rate_limit_handler)

# ── Security & Log Sanitization Middleware ────────────────────────────────────────
app.add_middleware(LogSanitizationMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

# ── Request Body Size Limit (1MB) ──────────────────────────────────────────────────
class LimitUploadSizeMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method in ("POST", "PUT", "PATCH"):
            content_length = request.headers.get("content-length")
            if content_length and int(content_length) > 1_000_000:
                return JSONResponse(status_code=413, content={"detail": "Request too large"})
        return await call_next(request)


app.add_middleware(LimitUploadSizeMiddleware)

# ── CORS ───────────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# ── Routers ────────────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(templates_router)
app.include_router(users_router)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception on {request.method} {request.url.path}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


@app.get("/", tags=["Health"])
async def health_check():
    return {"status": "ok", "message": "TaskFlow API is running", "version": "2.0.0"}
