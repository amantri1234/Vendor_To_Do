import json
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("taskflow")


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "font-src 'self' https://fonts.gstatic.com; "
            "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; "
            "img-src 'self' data:; "
            "connect-src 'self'"
        )
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Cache-Control"] = "no-store"
        return response


SENSITIVE_FIELDS = {"password", "current_password", "new_password", "token", "access_token"}


class LogSanitizationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        body = await request.body()
        if body and request.method in ("POST", "PUT", "PATCH"):
            try:
                data = json.loads(body)
                redacted = {
                    k: ("***REDACTED***" if k in SENSITIVE_FIELDS else v)
                    for k, v in data.items()
                }
                logger.info(f"{request.method} {request.url.path} body={json.dumps(redacted)}")
            except (json.JSONDecodeError, UnicodeDecodeError):
                logger.info(f"{request.method} {request.url.path} body=<binary or unparseable>")

        response = await call_next(request)
        return response
