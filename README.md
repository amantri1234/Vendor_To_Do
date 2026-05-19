# TaskFlow — Enterprise Task Management Application

A full-stack, multi-user task management app built with **FastAPI + MongoDB (Beanie) + React (Vite) + TailwindCSS**.
Professional-grade with rate limiting, account lockout, security headers, and a premium business UI.

---

## Table of Contents
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Docker Deployment](#docker-deployment)
- [API Reference](#api-reference)
- [Frontend Design System](#frontend-design-system)
- [Security Features](#security-features)
- [Environment Variables](#environment-variables)
- [How to Customize](#how-to-customize)
- [Change Log](#change-log)
- [License](#license)

---

## Project Structure

```
vendor_to_do/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point + lifespan + rate limiter + security middleware
│   │   ├── config.py            # pydantic-settings (MONGODB_URL, SECRET_KEY, RATE_LIMIT, etc.)
│   │   ├── database.py          # Beanie + Motor (async MongoDB ODM init with connection pooling)
│   │   ├── models/
│   │   │   └── models.py        # Beanie Documents: User, Task, Template (embedded tasks), FailedLoginAttempt
│   │   ├── schemas/
│   │   │   └── schemas.py       # Pydantic v2 request/response schemas with strong validation
│   │   ├── routers/
│   │   │   ├── auth.py          # POST /auth/register (3/min), /auth/login (5/min) + account lockout
│   │   │   ├── tasks.py         # Full CRUD + aggregation stats + bulk-delete + delete-completed
│   │   │   ├── templates.py     # CRUD + apply template (creates tasks from embedded template tasks)
│   │   │   └── users.py         # GET/PUT /users/me, PUT /users/change-password
│   │   ├── crud/
│   │   │   ├── user_crud.py     # Async MongoDB queries for user operations
│   │   │   ├── task_crud.py     # Pagination, create, update, complete, delete
│   │   │   └── template_crud.py # CRUD for templates + create tasks from template
│   │   └── core/
│   │       ├── security.py      # JWT (python-jose), bcrypt (passlib), OAuth2 dependency
│   │       ├── middleware.py    # SecurityHeadersMiddleware + LogSanitizationMiddleware
│   │       └── rate_limit.py    # slowapi Limiter instance (shared across routers)
│   ├── .env                     # MONGODB_URL, SECRET_KEY, RATE_LIMIT_*, DEBUG, CORS
│   ├── .env.example             # Template with placeholder values (safe to commit)
│   ├── Dockerfile               # Multi-stage build (now MySQL-free, lightweight)
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Routes with PrivateRoute/PublicRoute auth guards
│   │   ├── main.jsx             # React entry point
│   │   ├── index.css            # Tailwind + premium design system (Inter, Playfair Display)
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Premium navy/gold card, full-viewport no-scroll
│   │   │   ├── Register.jsx     # Premium navy/gold card, full-viewport no-scroll
│   │   │   ├── Dashboard.jsx    # Task list + filters + search + sort + pagination
│   │   │   ├── Templates.jsx    # Template management with one-click apply
│   │   │   ├── Profile.jsx      # User profile with change password
│   │   │   ├── Stats.jsx        # Analytics dashboard with aggregation pipeline
│   │   │   └── About.jsx        # App information
│   │   ├── components/
│   │   │   ├── Layout.jsx       # Navy sidebar with gold accents + user info
│   │   │   ├── TaskCard.jsx     # Individual task display with priority badges
│   │   │   ├── TaskModal.jsx    # Create / edit task form (modal overlay)
│   │   │   ├── TemplateModal.jsx # Create template with embedded tasks
│   │   │   └── ErrorBoundary.jsx # React error boundary with fallback UI
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # Global auth state with JWT management
│   │   │   └── ThemeContext.jsx # Dark mode toggle + system preference
│   │   ├── hooks/
│   │   │   ├── useTasks.js      # Task CRUD hook with optimistic updates
│   │   │   ├── useTemplates.js  # Template CRUD hook
│   │   │   └── useDebounce.js   # Debounce hook for search input
│   │   └── services/
│   │       └── api.js           # Axios instance + interceptors (auto JWT, 401 redirect)
│   ├── index.html
│   ├── vite.config.js           # Proxy /api → localhost:8000
│   ├── tailwind.config.js       # Premium palette: navy, gold, cream, charcoal
│   └── package.json
│
├── docker-compose.yml           # MongoDB 7.0 + Backend + Nginx
├── .gitignore                   # Ignores .env, .env.example, __pycache__, .pyc
├── requirements.txt             # Pinned Python dependencies
├── AGENTS.md                    # Detailed development context (for AI/developers)
└── README.md                    # This file
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend Framework** | FastAPI 0.111 | Async Python web framework |
| **Database** | MongoDB 7.0 (Atlas or local) via Beanie ODM + Motor | Schemaless document store |
| **Auth** | JWT (python-jose) + bcrypt (passlib) + OAuth2 | Token-based authentication |
| **Rate Limiting** | slowapi (Redis-compatible, in-memory) | Brute force protection |
| **Frontend** | React 18 + Vite 5 | Modern SPA |
| **Styling** | TailwindCSS 3.4 + PostCSS | Utility-first CSS |
| **Dark Mode** | Tailwind `dark:` variant + ThemeContext | System-aware, persisted preference |
| **Mobile** | Responsive sidebar + stacked grids | Works on all screen sizes |
| **Fonts** | Inter (body) + Playfair Display (headings) | Premium serif/sans pairing |
| **HTTP Client** | Axios with interceptors | Auto-attach JWT, handle 401 |
| **Notifications** | react-hot-toast | Toast notifications |
| **Containerization** | Docker + docker-compose | MongoDB 7.0 + Uvicorn + Nginx |

---

## Prerequisites

| Tool | Version | Required For |
|------|---------|-------------|
| Python | 3.10+ | Backend API |
| Node.js | 18+ | Frontend dev server |
| npm | 9+ | Frontend package management |
| MongoDB | 7.0 (Atlas or local) | Database |
| Docker | 24+ (optional) | Containerized deployment |

---

## Quick Start

### 1. Clone and Configure

```bash
git clone <repo-url> vendor_to_do
cd vendor_to_do

# Backend setup
cd backend
cp .env.example .env
# Edit .env — set your MONGODB_URL (Atlas string or localhost)
```

### 2. Start Backend

```bash
cd backend
pip install -r ../requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs: http://localhost:8000/docs (only when `DEBUG=true`)

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:3000

---

## Docker Deployment

```bash
docker-compose up --build
```

This starts:
- **MongoDB 7.0** on internal network (not exposed to host)
- **Backend** (FastAPI + Uvicorn, 4 workers) on port 8000
- **Frontend** (Nginx serving built React app) on port 80

---

## API Reference

### Auth
| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| POST | `/auth/register` | No | 3/min | Register → returns JWT + user |
| POST | `/auth/login` | No | 5/min | Login → returns JWT + user |

### Tasks *(JWT required)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks?skip=0&limit=50` | List tasks (paginated, sorted by newest) |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/{id}` | Update task fields |
| DELETE | `/tasks/{id}` | Delete a single task |
| PATCH | `/tasks/{id}/complete` | Mark task as completed |
| GET | `/tasks/stats` | Aggregate stats via MongoDB pipeline |
| POST | `/tasks/bulk-delete` | Delete multiple tasks by ID array |
| DELETE | `/tasks/completed` | Delete all completed tasks |

### Templates *(JWT required)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/templates` | List all templates (with embedded tasks) |
| POST | `/templates` | Create template with task list (max 100 tasks) |
| DELETE | `/templates/{id}` | Delete a template |
| POST | `/templates/{id}/create-tasks` | Apply template → creates tasks in task list |

### Users *(JWT required)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Get current user profile |
| PUT | `/users/me` | Update username |
| PUT | `/users/change-password` | Change password (requires current password) |

---

## Frontend Design System

### Color Palette
```
Teal   (#1A3C38 → #234B47 → #2E5D58) — Primary backgrounds, sidebar
Accent (#2D9F8B → #4DB8A4 → #238573) — Accents, active states, highlights
Cream  (#FBF9F6 → #F5F2EC → #E8E3DA) — Page backgrounds, cards
Slate  (#2D3748 → #4A5568 → #718096) — Body text
```

**Dark Mode**: Automatically toggles between light (cream) and dark (gray-900) using Tailwind's `dark:` variant. Preferences persist in `localStorage`. Respects system `prefers-color-scheme` on first visit.

### Typography
- **Headings**: Playfair Display (serif) — premium, elegant
- **Body**: Inter (sans-serif) — clean, high readability
- **Code/Monospace**: JetBrains Mono

### How to Modify the Design
- **Colors**: Edit `frontend/tailwind.config.js` → `theme.extend.colors`
- **Fonts**: Edit `frontend/tailwind.config.js` → `theme.extend.fontFamily`
- **Buttons/Inputs**: Edit `frontend/src/index.css` → `@layer components`
- **Login page layout**: `frontend/src/pages/Login.jsx`
- **Register page layout**: `frontend/src/pages/Register.jsx`
- **Sidebar**: `frontend/src/components/Layout.jsx`

---

## Security Features

### Rate Limiting
- **Login**: 5 requests per minute per IP (`backend/app/routers/auth.py:38`)
- **Register**: 3 requests per minute per IP (`backend/app/routers/auth.py:28`)
- **Global**: 200 requests per hour per IP (`backend/app/core/rate_limit.py:4`)

### Password Policy
- Minimum 12 characters
- At least 1 uppercase, 1 lowercase, 1 digit, 1 special character
- Validation in `backend/app/schemas/schemas.py:29` (UserCreate) and `backend/app/routers/users.py:34` (ChangePassword)

### Account Lockout
- 10 consecutive failed login attempts → 15-minute lockout
- Tracked in `FailedLoginAttempt` collection (`backend/app/models/models.py:51`)
- Logic in `backend/app/routers/auth.py:60-72`

### Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000; includeSubDomains
- Content-Security-Policy: default-src 'self'
- Referrer-Policy: strict-origin-when-cross-origin
- Cache-Control: no-store
- Applied via `backend/app/core/middleware.py:10`

### Log Sanitization
- Passwords are redacted from request logs (`backend/app/core/middleware.py:18`)

### User Enumeration Prevention
- `/auth/register` returns generic "Registration failed" regardless of duplicate email/username (`backend/app/routers/auth.py:29-36`)
- `/auth/login` returns generic "Invalid email or password" (`backend/app/routers/auth.py:44`)

### Global Error Handler
- 500 errors return `{"detail": "Internal server error"}` — no stack trace leakage (`backend/app/main.py:62`)

### CORS
- Configurable via `CORS_ORIGINS` env var (`backend/app/config.py:15`)
- Only allow specific origins (localhost:3000 by default)

### Debug Mode
- Defaults to `False` in production (`backend/app/config.py:14`)
- Swagger UI (`/docs`) only visible when `DEBUG=true` — this is **intentional and safe**. The Swagger UI allows developers to test endpoints interactively. In production, set `DEBUG=false` to hide it.
- Stack traces are **never** leaked — the global exception handler (`backend/app/main.py:62`) always returns `{"detail": "Internal server error"}` regardless of debug mode.
- This is a standard FastAPI pattern. Debug mode does **not** expose passwords, tokens, or user data.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URL` | `mongodb://localhost:27017` | MongoDB connection string (use Atlas SRV for cloud) |
| `MONGODB_DB_NAME` | `taskflow` | MongoDB database name |
| `SECRET_KEY` | `changeme-...` | JWT signing key (generate a random 32+ char string) |
| `ALGORITHM` | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | JWT token validity duration |
| `DEBUG` | `false` | Enable debug mode (shows /docs, stack traces) |
| `CORS_ORIGINS` | `["http://localhost:3000"]` | Allowed CORS origins (JSON array) |
| `RATE_LIMIT_ENABLED` | `true` | Enable/disable rate limiting globally |
| `RATE_LIMIT_LOGIN` | `5/minute` | Login endpoint rate limit |
| `RATE_LIMIT_REGISTER` | `3/minute` | Register endpoint rate limit |
| `RATE_LIMIT_GLOBAL` | `200/hour` | Global rate limit for all endpoints |

---

## How to Customize

### Backend

| Change | File | What to Edit |
|--------|------|-------------|
| Database name | `backend/app/config.py:9` | Change `MONGODB_DB_NAME` default |
| JWT expiry | `backend/app/config.py:13` | Change `ACCESS_TOKEN_EXPIRE_MINUTES` |
| Rate limit values | `backend/app/config.py:21-23` | Change `RATE_LIMIT_LOGIN`, `RATE_LIMIT_REGISTER`, `RATE_LIMIT_GLOBAL` |
| Password policy | `backend/app/schemas/schemas.py:29-41` | Edit `strong_password` validator regex |
| Account lockout threshold | `backend/app/routers/auth.py:16-17` | Change `MAX_FAILED_ATTEMPTS` or `LOCKOUT_MINUTES` |
| Add a new field to Task | `backend/app/models/models.py:29-39` | Add field to `Task` Document + `backend/app/schemas/schemas.py` for TaskCreate/TaskOut |
| Add a new API endpoint | `backend/app/routers/` | Create a new router file, add to `backend/app/routers/__init__.py` and `backend/app/main.py` |
| Security headers | `backend/app/core/middleware.py:10-16` | Add/remove headers in `SecurityHeadersMiddleware` |
| CORS origins | `backend/.env` | Edit `CORS_ORIGINS` JSON array |

### Frontend

| Change | File | What to Edit |
|--------|------|-------------|
| Primary color | `frontend/tailwind.config.js:13-17` | Change `navy` color values |
| Accent color | `frontend/tailwind.config.js:18-20` | Change `gold` color values |
| Background color | `frontend/tailwind.config.js:21-23` | Change `cream` color values |
| Text color | `frontend/tailwind.config.js:24-26` | Change `charcoal` color values |
| Heading font | `frontend/tailwind.config.js:7` | Change `Playfair Display` to another serif |
| Body font | `frontend/tailwind.config.js:8` | Change `Inter` to another sans-serif |
| Button styles | `frontend/src/index.css:31-49` | Edit `.btn`, `.btn-primary`, `.btn-ghost` |
| Input styles | `frontend/src/index.css:51-54` | Edit `.input`, `.label` |
| Login page design | `frontend/src/pages/Login.jsx` | Full layout, gradient, card |
| Register page design | `frontend/src/pages/Register.jsx` | Full layout, gradient, card |
| Sidebar navigation | `frontend/src/components/Layout.jsx` | Nav items, brand, user section |
| Task card | `frontend/src/components/TaskCard.jsx` | Task display layout |
| Task modal | `frontend/src/components/TaskModal.jsx` | Create/edit form |
| Template modal | `frontend/src/components/TemplateModal.jsx` | Create template form |
| API base URL | `frontend/vite.config.js` | Proxy target (for dev) or `frontend/src/services/api.js` for production |

### Database

| Change | How |
|--------|-----|
| Switch MongoDB database | Edit `MONGODB_DB_NAME` in `backend/.env` |
| Add indexes | Edit `backend/app/models/models.py` → `Settings.indexes` on the Document class |
| Add a new collection | Create new Beanie Document class in `backend/app/models/models.py` + add to `backend/app/database.py:21` `init_beanie()` document_models list |

---

## Change Log

### v2.0.0 — MongoDB Migration & Security Hardening

- **Full migration** from SQLite/MySQL (SQLAlchemy) → MongoDB (Beanie ODM + Motor)
- **All endpoints** converted from synchronous → asynchronous
- **IDs** changed from auto-increment integers → MongoDB ObjectId strings
- **TemplateTasks** now embedded inside Template documents (faster reads, no joins)
- **Removed** Alembic migrations (MongoDB is schemaless)
- **Updated** docker-compose from MySQL → MongoDB 7.0

#### Security

- **Rate limiting** added via slowapi (5/min login, 3/min register, 200/hr global)
- **Password policy** strengthened: 12+ chars, uppercase, lowercase, digit, special character
- **Account lockout**: 10 failed attempts → 15-minute lockout
- **Security headers**: HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **Log sanitization**: Passwords redacted from request logs
- **Global exception handler**: No stack trace leakage on 500
- **User enumeration prevention**: Generic error messages on auth endpoints
- **Password change endpoint**: `PUT /users/change-password`
- **Debug mode** defaults to `false` in production

#### Frontend Redesign

- **Premium business palette**: Navy (#0A1628), Gold (#C8A96E), Cream (#F8F6F1)
- **Typography**: Playfair Display (serif headings) + Inter (sans-serif body)
- **Login/Register**: Full viewport, no scroll, clean gradient backgrounds
- **Sidebar**: Navy with gold accents, premium feel
- **All pages** updated to use new color system

### v1.x — Original (SQLite/MySQL)

- Initial implementation with SQLAlchemy ORM
- SQLite for dev, MySQL for production
- Basic JWT authentication
- Dark sporty theme with orange accents

---

## Notes

- **MongoDB Atlas**: Use your SRV connection string in `MONGODB_URL`. Database auto-creates on first insert.
- **Indexes**: Auto-created by Beanie on startup (`backend/app/models/models.py`)
- **IDs**: All IDs are MongoDB ObjectId hex strings (24 characters)
- **JWT tokens**: Stored in `localStorage`, auto-attached via Axios interceptor (`frontend/src/services/api.js:10-13`)
- **401 responses**: Interceptor auto-redirects to `/login` (`frontend/src/services/api.js:20-23`)
- **Swagger UI**: Available at `/docs` only when `DEBUG=true` (safe — no data leaks occur regardless)
- **Password policy**: The 12-char minimum with complexity requirements is enforced on both register and password change

---

## License

MIT
