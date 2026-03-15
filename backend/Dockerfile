# ── Stage 1: Builder ──────────────────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    pkg-config \
    default-libmysqlclient-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install --prefix=/install --no-cache-dir -r requirements.txt


# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Only the runtime MySQL shared lib — no compiler needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    libmysqlclient21 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /install /usr/local

COPY app/     ./app/
COPY alembic/ ./alembic/
COPY alembic.ini .

# Drop root privileges
RUN useradd -m -u 1001 appuser && chown -R appuser /app
USER appuser

EXPOSE 8000

# Migrate then serve — 4 uvicorn workers for multi-core use
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4 --proxy-headers --forwarded-allow-ips='*'"]
