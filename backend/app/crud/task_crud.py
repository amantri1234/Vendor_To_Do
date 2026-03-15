from sqlalchemy.orm import Session
from sqlalchemy import update as sql_update
from typing import List, Optional
from app.models.models import Task, TaskStatus
from app.schemas.schemas import TaskCreate, TaskUpdate


def get_tasks(db: Session, owner_id: int) -> List[Task]:
    return (
        db.query(Task)
        .filter(Task.owner_id == owner_id)
        .order_by(Task.created_at.desc())
        .all()
    )


def get_task(db: Session, task_id: int, owner_id: int) -> Optional[Task]:
    return (
        db.query(Task)
        .filter(Task.id == task_id, Task.owner_id == owner_id)
        .first()
    )


def create_task(db: Session, task_data: TaskCreate, owner_id: int) -> Task:
    db_task = Task(**task_data.model_dump(), owner_id=owner_id)
    db.add(db_task)
    db.commit()
    return db_task   # expire_on_commit=False means no extra SELECT needed


def update_task(db: Session, task_id: int, task_data: TaskUpdate, owner_id: int) -> Optional[Task]:
    update_values = task_data.model_dump(exclude_unset=True)
    if not update_values:
        return get_task(db, task_id, owner_id)

    result = (
        db.query(Task)
        .filter(Task.id == task_id, Task.owner_id == owner_id)
        .update(update_values, synchronize_session="fetch")
    )
    if result == 0:
        return None
    db.commit()
    return get_task(db, task_id, owner_id)


def delete_task(db: Session, task_id: int, owner_id: int) -> bool:
    deleted = (
        db.query(Task)
        .filter(Task.id == task_id, Task.owner_id == owner_id)
        .delete(synchronize_session="fetch")
    )
    db.commit()
    return deleted > 0


def complete_task(db: Session, task_id: int, owner_id: int) -> Optional[Task]:
    result = (
        db.query(Task)
        .filter(Task.id == task_id, Task.owner_id == owner_id)
        .update(
            {"is_completed": True, "status": TaskStatus.completed},
            synchronize_session="fetch",
        )
    )
    if result == 0:
        return None
    db.commit()
    return get_task(db, task_id, owner_id)
