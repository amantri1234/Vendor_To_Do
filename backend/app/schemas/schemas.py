from pydantic import BaseModel, EmailStr, field_validator, model_validator
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
import re


# ── Auth Schemas ──────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

    @field_validator("username")
    @classmethod
    def username_valid(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        if len(v) > 100:
            raise ValueError("Username must be 100 characters or fewer")
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("Username may only contain letters, numbers, hyphens, and underscores")
        return v

    @field_validator("password")
    @classmethod
    def strong_password(cls, v: str) -> str:
        if len(v) < 12:
            raise ValueError("Password must be at least 12 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain an uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain a lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain a digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-]", v):
            raise ValueError("Password must contain a special character")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    username: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}

    @field_validator("id", mode="before")
    @classmethod
    def coerce_id(cls, v):
        return str(v)


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# ── Task Schemas ──────────────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "pending"
    priority: str = "medium"
    due_date: Optional[datetime] = None

    @field_validator("status")
    @classmethod
    def status_valid(cls, v: str) -> str:
        allowed = ("pending", "in-progress", "completed")
        if v not in allowed:
            raise ValueError(f"Status must be one of {allowed}")
        return v

    @field_validator("priority")
    @classmethod
    def priority_valid(cls, v: str) -> str:
        allowed = ("low", "medium", "high")
        if v not in allowed:
            raise ValueError(f"Priority must be one of {allowed}")
        return v

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Title cannot be empty")
        if len(v) > 255:
            raise ValueError("Title must be 255 characters or fewer")
        return v

    @field_validator("description")
    @classmethod
    def description_length(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v) > 5000:
            raise ValueError("Description must be 5000 characters or fewer")
        return v


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    is_completed: Optional[bool] = None

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Title cannot be empty")
        return v

    @field_validator("status")
    @classmethod
    def status_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            allowed = ("pending", "in-progress", "completed")
            if v not in allowed:
                raise ValueError(f"Status must be one of {allowed}")
        return v

    @field_validator("priority")
    @classmethod
    def priority_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            allowed = ("low", "medium", "high")
            if v not in allowed:
                raise ValueError(f"Priority must be one of {allowed}")
        return v

    @field_validator("description")
    @classmethod
    def description_length(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v) > 5000:
            raise ValueError("Description must be 5000 characters or fewer")
        return v

    @model_validator(mode="after")
    def at_least_one_field(self) -> "TaskUpdate":
        if all(v is None for v in self.model_dump().values()):
            raise ValueError("At least one field must be provided for update")
        return self


class TaskOut(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    due_date: Optional[datetime] = None
    is_completed: bool
    owner_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

    @field_validator("id", "owner_id", mode="before")
    @classmethod
    def coerce_ids(cls, v):
        return str(v)


# ── Template Schemas ──────────────────────────────────────────────────────────

class TemplateTaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    order: int = 0

    @field_validator("priority")
    @classmethod
    def priority_valid(cls, v: str) -> str:
        allowed = ("low", "medium", "high")
        if v not in allowed:
            raise ValueError(f"Priority must be one of {allowed}")
        return v

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Task title cannot be empty")
        return v

    @field_validator("description")
    @classmethod
    def description_length(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v) > 5000:
            raise ValueError("Description must be 5000 characters or fewer")
        return v


class TemplateTaskOut(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    priority: str
    order: int

    @field_validator("id", mode="before")
    @classmethod
    def coerce_id(cls, v):
        return str(v)


class TemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    tasks: List[TemplateTaskCreate] = []

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Template name cannot be empty")
        if len(v) > 200:
            raise ValueError("Template name must be 200 characters or fewer")
        return v

    @field_validator("tasks")
    @classmethod
    def tasks_not_too_many(cls, v: List[TemplateTaskCreate]) -> List[TemplateTaskCreate]:
        if len(v) > 100:
            raise ValueError("A template can contain at most 100 tasks")
        return v


class TemplateOut(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    owner_id: str
    created_at: datetime
    template_tasks: List[TemplateTaskOut] = []

    model_config = {"from_attributes": True, "populate_by_name": True}

    @field_validator("id", "owner_id", mode="before")
    @classmethod
    def coerce_ids(cls, v):
        return str(v)

    @field_validator("template_tasks", mode="before")
    @classmethod
    def coerce_tasks(cls, v):
        if isinstance(v, list):
            return v
        return []


# ── Task Stats ────────────────────────────────────────────────────────────────

class TaskStats(BaseModel):
    total: int = 0
    pending: int = 0
    in_progress: int = 0
    completed: int = 0
    high_priority: int = 0
    medium_priority: int = 0
    low_priority: int = 0
    overdue: int = 0
