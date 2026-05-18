# TaskFlow — Full-Stack To-Do List Application

A scalable, multi-user task management app built with **FastAPI + SQLite/MySQL + React (Vite) + TailwindCSS**.

---

## Project Structure

```
vendor_to_do/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Settings via pydantic-settings
│   │   ├── database.py          # SQLAlchemy engine + session
│   │   ├── models/
│   │   │   └── models.py        # ORM models: User, Task, Template, TemplateTask
│   │   ├── schemas/
│   │   │   └── schemas.py       # Pydantic request/response schemas
│   │   ├── routers/
│   │   │   ├── auth.py          # POST /auth/register, /auth/login
│   │   │   ├── tasks.py         # GET/POST/PUT/DELETE/PATCH /tasks + stats + bulk-delete
│   │   │   ├── templates.py     # GET/POST/DELETE /templates + apply
│   │   │   └── users.py         # GET/PUT /users/me
│   │   ├── crud/
│   │   │   ├── user_crud.py
│   │   │   ├── task_crud.py     # pagination via skip/limit
│   │   │   └── template_crud.py
│   │   └── core/
│   │       └── security.py      # JWT, bcrypt, auth dependency
│   ├── alembic/                 # DB migrations
│   ├── alembic.ini
│   └── .env                     # DATABASE_URL, SECRET_KEY, etc.
│
└── frontend/
    ├── src/
    │   ├── App.jsx              # Routes + auth guards
    │   ├── main.jsx             # React entry point
    │   ├── index.css            # Tailwind + global styles
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx    # Task list + filters + search + sort
    │   │   ├── Templates.jsx    # Template management
    │   │   ├── Profile.jsx      # User profile
    │   │   ├── Stats.jsx        # Analytics dashboard
    │   │   └── About.jsx        # App information
    │   ├── components/
    │   │   ├── Layout.jsx       # Sidebar navigation
    │   │   ├── TaskCard.jsx     # Individual task display
    │   │   ├── TaskModal.jsx    # Create / edit task form
    │   │   └── TemplateModal.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx  # Global auth state
    │   ├── hooks/
    │   │   ├── useTasks.js
    │   │   └── useTemplates.js
    │   └── services/
    │       └── api.js           # Axios instance + all API calls
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## Prerequisites

| Tool   | Version |
|--------|---------|
| Python | 3.10+   |
| Node.js | 18+   |
| MySQL  | 8.0+ (optional — SQLite works out of the box) |

---

## Quick Start

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env — set DATABASE_URL for MySQL or leave as SQLite default
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
API docs: http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App: http://localhost:3000

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user → returns JWT |
| POST | `/auth/login` | Login → returns JWT |

### Tasks *(JWT required)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks?skip=0&limit=50` | List tasks (paginated) |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/{id}` | Update a task |
| DELETE | `/tasks/{id}` | Delete a task |
| PATCH | `/tasks/{id}/complete` | Mark task as completed |
| GET | `/tasks/stats` | Aggregate task statistics |
| POST | `/tasks/bulk-delete` | Delete multiple tasks by ID |
| DELETE | `/tasks/completed` | Delete all completed tasks |

### Templates *(JWT required)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/templates` | List all templates |
| POST | `/templates` | Create a template with tasks |
| DELETE | `/templates/{id}` | Delete a template |
| POST | `/templates/{id}/create-tasks` | Apply template → creates tasks |

### Users *(JWT required)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Get current user profile |
| PUT | `/users/me` | Update username |

---

## Features

### Task Management
- Create, edit, delete tasks
- Set **status**: `pending` / `in-progress` / `completed`
- Set **priority**: `low` / `medium` / `high`
- Add due dates and descriptions
- One-click mark as complete
- Filter by status, sort by priority/due date/newest, full-text search
- Pagination (10 tasks per page)
- Bulk delete all completed tasks

### Templates
- Build reusable task bundles (e.g. "Morning Routine", "Sprint Planning")
- Each template holds ordered tasks with title, description, and priority
- **Apply Template** — instantly creates all template tasks in your task list
- Preview tasks inside each template card before applying

### Analytics
- Dashboard with completion stats
- Priority breakdown & status visualization
- Completion rate progress bar
- Overdue task tracking

### User Profile
- View and edit username
- Account information display

### Authentication
- JWT-based auth (stored in `localStorage`)
- bcrypt password hashing via Passlib
- Axios interceptor auto-attaches `Authorization: Bearer <token>`
- Automatic redirect to `/login` on 401

---

## Fixes Applied

1. **bcrypt compatibility**: bcrypt 5.x incompatible with passlib 1.7.4 — pinned `bcrypt==4.0.1`
2. **SQLite support**: database.py auto-detects SQLite vs MySQL (different pool classes, connect_args)
3. **TailwindCSS font weights**: Added custom `font-600`, `font-700`, `font-800` utilities

## Docker

```bash
docker-compose up --build
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./taskflow.db` | Database connection string |
| `SECRET_KEY` | `dev-secret-key-…` | JWT signing key (change in production!) |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Token validity duration |
| `DEBUG` | `true` | Enable/disable debug mode |
| `CORS_ORIGINS` | `["http://localhost:3000"]` | Allowed CORS origins |

---

## Notes
- SQLite is default for local dev. Switch `DATABASE_URL` for MySQL in production.
- Tables auto-create on startup via `Base.metadata.create_all()` (dev mode).
- JWT tokens stored in localStorage on frontend, auto-attached via Axios interceptor.
