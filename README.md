# TaskFlow — Full-Stack To-Do List Application

A scalable, multi-user task management app built with **FastAPI + MySQL + React**.

---

## Project Structure

```
todo-app/
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
│   │   │   ├── tasks.py         # GET/POST/PUT/DELETE/PATCH /tasks
│   │   │   └── templates.py     # GET/POST/DELETE /templates + apply
│   │   ├── crud/
│   │   │   ├── user_crud.py
│   │   │   ├── task_crud.py
│   │   │   └── template_crud.py
│   │   └── core/
│   │       └── security.py      # JWT, bcrypt, auth dependency
│   ├── alembic/                 # DB migrations
│   ├── alembic.ini
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── App.jsx              # Routes + auth guards
    │   ├── main.jsx             # React entry point
    │   ├── index.css            # Tailwind + global styles
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx    # Task management
    │   │   └── Templates.jsx    # Template management
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

| Tool | Version |
|------|---------|
| Python | 3.11+ |
| Node.js | 18+ |
| MySQL | 8.0+ |

---

## 1 · Database Setup

```sql
-- Run in MySQL shell
CREATE DATABASE todoapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'todouser'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON todoapp.* TO 'todouser'@'localhost';
FLUSH PRIVILEGES;
```

---

## 2 · Backend Setup

```bash
cd todo-app/backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — update DATABASE_URL and SECRET_KEY:
#   DATABASE_URL=mysql+pymysql://todouser:yourpassword@localhost:3306/todoapp
#   SECRET_KEY=<generate with: python -c "import secrets; print(secrets.token_hex(32))">
```

### Run database migrations (choose one approach)

**Option A — Auto-create on startup (development)**
Tables are created automatically when the server starts. Nothing extra to do.

**Option B — Alembic (production recommended)**
```bash
# Generate migration from models
alembic revision --autogenerate -m "initial"

# Apply migration
alembic upgrade head
```

### Start the backend server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at: http://localhost:8000/docs

---

## 3 · Frontend Setup

```bash
cd todo-app/frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend available at: http://localhost:3000

---

## 4 · API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user → returns JWT |
| POST | `/auth/login` | Login → returns JWT |

### Tasks *(JWT required)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | List all tasks for the current user |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/{id}` | Update a task |
| DELETE | `/tasks/{id}` | Delete a task |
| PATCH | `/tasks/{id}/complete` | Mark task as completed |

### Templates *(JWT required)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/templates` | List all templates |
| POST | `/templates` | Create a template with tasks |
| DELETE | `/templates/{id}` | Delete a template |
| POST | `/templates/{id}/create-tasks` | Apply template → creates tasks |

---

## 5 · Feature Overview

### Task Management
- Create, edit, delete tasks
- Set **status**: `pending` / `in-progress` / `completed`
- Set **priority**: `low` / `medium` / `high`
- Add due dates and descriptions
- One-click mark as complete
- Filter by status, sort by priority/due date/newest, full-text search

### Templates
- Build reusable task bundles (e.g. "Morning Routine", "Sprint Planning")
- Each template holds ordered tasks with title, description, and priority
- **Apply Template** — instantly creates all template tasks in your task list
- Preview tasks inside each template card before applying

### Authentication
- JWT-based auth (stored in `localStorage`)
- bcrypt password hashing via Passlib
- Axios interceptor auto-attaches `Authorization: Bearer <token>`
- Automatic redirect to `/login` on 401

---

## 6 · Production Deployment Notes

1. **Secret key** — generate a strong key: `python -c "import secrets; print(secrets.token_hex(32))"`
2. **CORS** — update `allow_origins` in `main.py` to your actual frontend domain
3. **Database** — use Alembic migrations instead of `create_all` on startup
4. **Frontend build** — run `npm run build` and serve the `dist/` folder via Nginx or a CDN
5. **Process manager** — use `gunicorn` with `uvicorn` workers:
   ```bash
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```

---

## 7 · Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `mysql+pymysql://root:password@localhost:3306/todoapp` | MySQL connection string |
| `SECRET_KEY` | `changeme-…` | JWT signing key (change in production!) |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Token validity duration |
