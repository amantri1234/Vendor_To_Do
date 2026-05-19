from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from typing import List
from app.core.security import get_current_user
from app.core.rate_limit import limiter
from app.models.models import User, Task, TaskStatus
from app.schemas.schemas import TaskCreate, TaskUpdate, TaskOut, TaskStats
from app.crud import task_crud
from bson import ObjectId
from datetime import datetime, timezone

router = APIRouter(prefix="/tasks", tags=["Tasks"])


def _to_out(task: Task) -> TaskOut:
    return TaskOut.model_validate(task.model_dump())


@router.get("/stats", response_model=TaskStats)
async def task_stats(current_user: User = Depends(get_current_user)):
    from app.models.models import Task

    now = datetime.now(timezone.utc)

    pipeline = [
        {"$match": {"owner_id": str(current_user.id)}},
        {
            "$group": {
                "_id": None,
                "total": {"$sum": 1},
                "pending": {"$sum": {"$cond": [{"$eq": ["$status", TaskStatus.pending.value]}, 1, 0]}},
                "in_progress": {"$sum": {"$cond": [{"$eq": ["$status", TaskStatus.in_progress.value]}, 1, 0]}},
                "completed": {"$sum": {"$cond": [{"$eq": ["$is_completed", True]}, 1, 0]}},
                "high_priority": {"$sum": {"$cond": [{"$eq": ["$priority", "high"]}, 1, 0]}},
                "medium_priority": {"$sum": {"$cond": [{"$eq": ["$priority", "medium"]}, 1, 0]}},
                "low_priority": {"$sum": {"$cond": [{"$eq": ["$priority", "low"]}, 1, 0]}},
                "overdue": {
                    "$sum": {
                        "$cond": [
                            {"$and": [
                                {"$lt": ["$due_date", now]},
                                {"$eq": ["$is_completed", False]},
                            ]},
                            1, 0,
                        ]
                    }
                },
            }
        },
    ]

    results = await Task.get_motor_collection().aggregate(pipeline).to_list(None)
    if not results:
        return TaskStats()
    r = results[0]
    return TaskStats(
        total=r.get("total", 0),
        pending=r.get("pending", 0),
        in_progress=r.get("in_progress", 0),
        completed=r.get("completed", 0),
        high_priority=r.get("high_priority", 0),
        medium_priority=r.get("medium_priority", 0),
        low_priority=r.get("low_priority", 0),
        overdue=r.get("overdue", 0),
    )


@router.post("/bulk-delete", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
async def bulk_delete_tasks(
    request: Request,
    task_ids: List[str],
    current_user: User = Depends(get_current_user),
):
    obj_ids = []
    for tid in task_ids:
        try:
            obj_ids.append(ObjectId(tid))
        except Exception:
            raise HTTPException(status_code=400, detail=f"Invalid task ID: {tid}")

    result = await Task.get_motor_collection().delete_many({
        "_id": {"$in": obj_ids},
        "owner_id": str(current_user.id),
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No tasks found")


@router.delete("/completed", status_code=status.HTTP_204_NO_CONTENT)
async def delete_completed_tasks(current_user: User = Depends(get_current_user)):
    await Task.get_motor_collection().delete_many({
        "owner_id": str(current_user.id),
        "is_completed": True,
    })


@router.get("", response_model=List[TaskOut])
async def list_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
):
    tasks = await task_crud.get_tasks(str(current_user.id), skip=skip, limit=limit)
    return [_to_out(t) for t in tasks]


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("60/minute")
async def create_task(
    request: Request,
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
):
    task = await task_crud.create_task(task_data, str(current_user.id))
    return _to_out(task)


@router.put("/{task_id}", response_model=TaskOut)
@limiter.limit("60/minute")
async def update_task(
    request: Request,
    task_id: str,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
):
    task = await task_crud.update_task(task_id, task_data, str(current_user.id))
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return _to_out(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
async def delete_task(
    request: Request,
    task_id: str,
    current_user: User = Depends(get_current_user),
):
    deleted = await task_crud.delete_task(task_id, str(current_user.id))
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")


@router.patch("/{task_id}/complete", response_model=TaskOut)
@limiter.limit("60/minute")
async def complete_task(
    request: Request,
    task_id: str,
    current_user: User = Depends(get_current_user),
):
    task = await task_crud.complete_task(task_id, str(current_user.id))
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return _to_out(task)
