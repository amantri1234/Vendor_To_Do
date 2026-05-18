# TaskFlow — Development Context

## Project Overview
Full-stack task management app: **FastAPI + SQLite/MySQL + React (Vite) + TailwindCSS**
Multi-user, JWT-authenticated, with task templates.

## Architecture

```
vendor_to_do/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point + lifespan hooks
│   │   ├── config.py            # pydantic-settings (DATABASE_URL, SECRET_KEY, etc.)
│   │   ├── database.py          # SQLAlchemy engine (auto-detects SQLite vs MySQL)
│   │   ├── models/models.py     # User, Task, Template, TemplateTask ORM
│   │   ├── schemas/schemas.py   # Pydantic request/response schemas
│   │   ├── routers/
│   │   │   ├── auth.py          # POST /auth/register, /auth/login
│   │   │   ├── tasks.py         # CRUD + stats + bulk-delete
│   │   │   ├── templates.py     # CRUD + apply template
│   │   │   └── users.py         # GET/PUT /users/me
│   │   ├── crud/
│   │   │   ├── user_crud.py
│   │   │   ├── task_crud.py     # pagination via skip/limit
│   │   │   └── template_crud.py
│   │   └── core/security.py     # JWT, bcrypt, auth dependency
│   ├── alembic/                 # DB migrations
│   └── .env                     # DATABASE_URL, SECRET_KEY, etc.
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Routes
│   │   ├── pages/
│   │   │   ├── Login.jsx, Register.jsx
│   │   │   ├── Dashboard.jsx    # Task list + filters + search + sort
│   │   │   ├── Templates.jsx    # Template management
│   │   │   ├── Profile.jsx      # User profile (NEW)
│   │   │   ├── Stats.jsx        # Analytics dashboard (NEW)
│   │   │   └── About.jsx        # App info (NEW)
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
└── docker-compose.yml           # MySQL + Backend + Nginx
```

## Setup & Run

### Backend
```bash
cd backend
cp .env.example .env   # Edit DATABASE_URL for MySQL or use SQLite default
pip install -r requirements.txt
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
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | /auth/register | No |
| POST | /auth/login | No |

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

## Changes Made

### Fixed Issues
1. **bcrypt compatibility**: bcrypt 5.x incompatible with passlib 1.7.4. Pinned `bcrypt==4.0.1` in requirements.txt
2. **SQLite support**: database.py now auto-detects SQLite vs MySQL (different pool classes, connect_args)
3. **config.py**: Working with pydantic-settings v2 (class Config still works in 2.2.1)

### New Backend Features
1. **`GET /tasks/stats`** — Aggregate stats: total, pending, in-progress, completed, by priority, overdue count
2. **`POST /tasks/bulk-delete`** — Delete multiple tasks by ID array
3. **`DELETE /tasks/completed`** — Delete all completed tasks at once
4. **`GET /users/me`** — Get current user profile
5. **`PUT /users/me`** — Update current user profile (username)
6. **Pagination** — `GET /tasks?skip=0&limit=50` for paginated task listing

### New Frontend Pages (Done)
1. **Profile.jsx** — `/profile` — View/edit username, email display
2. **Stats.jsx** — `/stats` — Analytics dashboard with task stats, completion rate, priority breakdown
3. **About.jsx** — `/about` — App information page with tech stack and features

### New Frontend Features (Done)
1. **Bulk delete completed tasks** button on Dashboard (with confirmation flow)
2. **Pagination controls** on Dashboard (10 tasks per page)
3. **Updated Layout sidebar** with links to Analytics, Profile, and About pages
4. **API integration** — usersAPI, tasksAPI.stats, tasksAPI.bulkDelete, tasksAPI.deleteCompleted

## Remaining Work / Future Ideas
- Dark mode toggle
- Task categories/tags
- Email notifications for due tasks
- File attachments on tasks
- Task sharing between users

## Environment Variables (.env)
```
DATABASE_URL=sqlite:///./taskflow.db    # or mysql+pymysql://user:pass@host/db
SECRET_KEY=<random-32-chars>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
DEBUG=true
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
```

## Notes
- SQLite is default for local dev. Switch DATABASE_URL for MySQL in production.
- Tables auto-create on startup via `Base.metadata.create_all()` (dev mode).
- JWT tokens stored in localStorage on frontend, auto-attached via Axios interceptor.
- 401 responses auto-redirect to /login.
- Backend auto-restarts on file changes (uvicorn --reload).
