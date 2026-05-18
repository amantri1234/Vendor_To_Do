from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Task, TaskStatus
from app.schemas.schemas import TaskCreate, TaskUpdate, TaskOut
from app.crud import task_crud
from pydantic import BaseModel

router = APIRouter(prefix="/tasks", tags=["Tasks"])


class TaskStats(BaseModel):
    total: int
    pending: int
    in_progress: int
    completed: int
    high_priority: int
    medium_priority: int
    low_priority: int
    overdue: int


@router.get("/stats", response_model=TaskStats)
def task_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from datetime import datetime, timezone
    base = db.query(Task).filter(Task.owner_id == current_user.id)
    return TaskStats(
        total=base.count(),
        pending=base.filter(Task.status == TaskStatus.pending).count(),
        in_progress=base.filter(Task.status == TaskStatus.in_progress).count(),
        completed=base.filter(Task.is_completed == True).count(),
        high_priority=base.filter(Task.priority == "high").count(),
        medium_priority=base.filter(Task.priority == "medium").count(),
        low_priority=base.filter(Task.priority == "low").count(),
        overdue=base.filter(
            Task.due_date < datetime.now(timezone.utc),
            Task.is_completed == False
        ).count(),
    )


@router.post("/bulk-delete", status_code=status.HTTP_204_NO_CONTENT)
def bulk_delete_tasks(
    task_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted = (
        db.query(Task)
        .filter(Task.id.in_(task_ids), Task.owner_id == current_user.id)
        .delete(synchronize_session="fetch")
    )
    db.commit()
    if deleted == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No tasks found")


@router.delete("/completed", status_code=status.HTTP_204_NO_CONTENT)
def delete_completed_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(Task).filter(
        Task.owner_id == current_user.id,
        Task.is_completed == True
    ).delete(synchronize_session="fetch")
    db.commit()


@router.get("", response_model=List[TaskOut])
def list_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return task_crud.get_tasks(db, current_user.id, skip=skip, limit=limit)


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return task_crud.create_task(db, task_data, current_user.id)


@router.put("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = task_crud.update_task(db, task_id, task_data, current_user.id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted = task_crud.delete_task(db, task_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")


@router.patch("/{task_id}/complete", response_model=TaskOut)
def complete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = task_crud.complete_task(db, task_id, current_user.id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task
