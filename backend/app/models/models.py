from beanie import Document, Indexed
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
import enum


class TaskStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in-progress"
    completed = "completed"


class TaskPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


class User(Document):
    email: Indexed(str, unique=True)
    username: Indexed(str, unique=True)
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"


class TemplateTaskEmbedded(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    title: str
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.medium
    order: int = 0


class Task(Document):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.pending
    priority: TaskPriority = TaskPriority.medium
    due_date: Optional[datetime] = None
    is_completed: bool = False
    owner_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None

    class Settings:
        name = "tasks"
        indexes = [
            [("owner_id", 1), ("status", 1)],
            [("owner_id", 1), ("priority", 1)],
            [("owner_id", 1), ("due_date", 1)],
            [("created_at", -1)],
        ]


class Template(Document):
    name: str
    description: Optional[str] = None
    owner_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    tasks: List[TemplateTaskEmbedded] = []

    class Settings:
        name = "templates"
        indexes = ["owner_id"]


class FailedLoginAttempt(Document):
    email: Indexed(str)
    attempt_count: int = 1
    first_attempt_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    locked_until: Optional[datetime] = None

    class Settings:
        name = "failed_login_attempts"


class TokenBlacklist(Document):
    token_jti: Indexed(str, unique=True)
    blacklisted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime

    class Settings:
        name = "token_blacklist"
        indexes = ["expires_at"]
