# TaskFlow — Development Context

## Project Overview
Full-stack task management app: **FastAPI + MongoDB (Beanie) + React (Vite) + TailwindCSS**
Multi-user, JWT-authenticated, with task templates.

## Architecture

```
vendor_to_do/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point + lifespan hooks
│   │   ├── config.py            # pydantic-settings (MONGODB_URL, SECRET_KEY, etc.)
│   │   ├── database.py          # Beanie + Motor (async MongoDB ODM init)
│   │   ├── models/models.py     # User, Task, Template (embedded TemplateTasks), FailedLoginAttempt
│   │   ├── schemas/schemas.py   # Pydantic request/response schemas
│   │   ├── routers/
│   │   │   ├── auth.py          # POST /auth/register, /auth/login (rate-limited)
│   │   │   ├── tasks.py         # CRUD + stats + bulk-delete
│   │   │   ├── templates.py     # CRUD + apply template
│   │   │   └── users.py         # GET/PUT /users/me, PUT /users/change-password
│   │   ├── crud/
│   │   │   ├── user_crud.py
│   │   │   ├── task_crud.py     # pagination via skip/limit
│   │   │   └── template_crud.py
│   │   └── core/
│   │       ├── security.py      # JWT, bcrypt, auth dependency + token blacklist check
│   │       ├── middleware.py    # Security headers + log sanitization (password redaction)
│   │       └── rate_limit.py    # slowapi limiter
│   └── .env                     # MONGODB_URL, SECRET_KEY, etc.
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Routes
│   │   ├── pages/
│   │   │   ├── Login.jsx, Register.jsx
│   │   │   ├── Dashboard.jsx    # Task list + filters + search + sort
│   │   │   ├── Templates.jsx    # Template management
│   │   │   ├── Profile.jsx      # User profile
│   │   │   ├── Stats.jsx        # Analytics dashboard
│   │   │   └── About.jsx        # App info
│   │   ├── components/
│   │   │   ├── Layout.jsx       # Sidebar nav + user info
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskModal.jsx
│   │   │   ├── TemplateModal.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   ├── context/AuthContext.jsx
│   │   ├── hooks/useTasks.js, useTemplates.js, useDebounce.js
│   │   └── services/api.js      # Axios + interceptors
│   └── vite.config.js           # Proxy /api → localhost:8000
└── docker-compose.yml           # MongoDB + Backend + Nginx
```

## Setup & Run

### Backend
```bash
cd backend
cp .env.example .env   # Edit MONGODB_URL for your MongoDB instance
pip install -r ../requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev   # → http://localhost:3000
```

### Docker
```bash
docker-compose up --build
```

## API Endpoints

### Auth
| Method | Endpoint | Auth | Rate Limit |
|--------|----------|------|------------|
| POST | /auth/register | No | 3/min |
| POST | /auth/login | No | 5/min |
| POST | /auth/logout | Yes | — |

### Tasks
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | /tasks?skip=0&limit=50 | Yes |
| POST | /tasks | Yes |
| PUT | /tasks/{id} | Yes |
| DELETE | /tasks/{id} | Yes |
| PATCH | /tasks/{id}/complete | Yes |
| GET | /tasks/stats | Yes |
| POST | /tasks/bulk-delete | Yes |
| DELETE | /tasks/completed | Yes |

### Templates
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | /templates | Yes |
| POST | /templates | Yes |
| DELETE | /templates/{id} | Yes |
| POST | /templates/{id}/create-tasks | Yes |

### Users
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | /users/me | Yes |
| PUT | /users/me | Yes |
| PUT | /users/change-password | Yes |

## Migration: SQLite → MongoDB (Beanie)

### What Changed
1. **Database**: SQLite/MySQL → MongoDB via Beanie ODM + Motor
2. **Models**: SQLAlchemy ORM models → Beanie Documents (async)
3. **Template Tasks**: Now **embedded** inside Template documents (no separate collection)
4. **IDs**: Auto-increment integers → MongoDB ObjectId strings
5. **All endpoints**: Synchronous → asynchronous (async/await)
6. **Alembic**: Removed (schemaless MongoDB)
7. **docker-compose**: MySQL container → MongoDB container

### Security Improvements
1. **Rate Limiting**: slowapi — 5/min login, 3/min register, 200/hr global
2. **Password Policy**: 12+ chars, uppercase, lowercase, digit, special character
3. **Account Lockout**: 10 failed attempts → 15-min lockout (FailedLoginAttempt model)
4. **Security Headers**: X-Content-Type-Options, X-Frame-Options, HSTS, CSP, Referrer-Policy
5. **User Enumeration Prevention**: Generic error messages on register
6. **Log Sanitization**: Passwords redacted from request logs
7. **Global Exception Handler**: 500 errors don't leak stack traces
8. **Password Change Endpoint**: PUT /users/change-password (requires current password)
9. **Token Blacklist**: POST /auth/logout revokes JWT — blacklisted tokens rejected globally
10. **Timing Attack Protection**: Login always hashes a dummy password for non-existent users
11. **SECRET_KEY Warning**: Startup warning if default key detected
12. **Debug Mode**: Defaults to False in production

## Design System

### Color Palette
- **navy**: #0A1628 (base), #111D35 (soft), #1A2744 (muted) — primary backgrounds
- **gold**: #C8A96E (base), #D4BC8A (light), #A8884E (dark) — accents
- **cream**: #F8F6F1 (base), #F0ECE4 (soft), #E0D9CC (dim) — page backgrounds
- **charcoal**: #1E1E1E (base), #2D2D2D (soft), #4A4A4A (muted) — text

### Fonts
- Headings: Playfair Display (serif, weights 500-800)
- Body: Inter (sans-serif)
- Mono: JetBrains Mono

## Environment Variables (.env)
```
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=vendor_to_do
SECRET_KEY=<random-32-chars>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
DEBUG=false
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
RATE_LIMIT_ENABLED=true
RATE_LIMIT_LOGIN=5/minute
RATE_LIMIT_REGISTER=3/minute
RATE_LIMIT_GLOBAL=200/hour
```

## Notes
- **MongoDB Atlas**: Use your connection string in MONGODB_URL
- **Indexes**: Auto-created by Beanie on startup
- **Embedded Tasks**: TemplateTask documents are embedded inside Template — faster reads
- **202 response**: Task IDs/User IDs are now MongoDB ObjectId strings (not integers)
- **JWT tokens**: Stored in localStorage, auto-attached via Axios interceptor
- **401 responses**: Auto-redirect to /login (frontend handles this)
- **Docs**: Swagger UI at /docs only when DEBUG=true

## Dependencies
- fastapi, uvicorn, beanie, motor, python-jose, passlib, bcrypt, slowapi, pydantic, pydantic-settings, python-multipart, email-validator
