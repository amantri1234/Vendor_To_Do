from typing import Optional, List
from bson import ObjectId
from bson.errors import InvalidId
from app.models.models import Task, TaskStatus
from app.schemas.schemas import TaskCreate, TaskUpdate
from datetime import datetime, timezone


async def get_tasks(owner_id: str, skip: int = 0, limit: int = 50) -> List[Task]:
    return (
        await Task.find(Task.owner_id == owner_id)
        .sort(-Task.created_at)
        .skip(skip)
        .limit(limit)
        .to_list()
    )


async def get_task(task_id: str, owner_id: str) -> Optional[Task]:
    try:
        obj_id = ObjectId(task_id)
    except InvalidId:
        return None
    return await Task.find_one(
        Task.id == obj_id,
        Task.owner_id == owner_id,
    )


async def create_task(task_data: TaskCreate, owner_id: str) -> Task:
    task = Task(**task_data.model_dump(), owner_id=owner_id)
    await task.insert()
    return task


async def update_task(task_id: str, task_data: TaskUpdate, owner_id: str) -> Optional[Task]:
    task = await get_task(task_id, owner_id)
    if not task:
        return None
    update_values = task_data.model_dump(exclude_unset=True, exclude_none=True)
    if not update_values:
        return task
    for key, value in update_values.items():
        setattr(task, key, value)
    task.updated_at = datetime.now(timezone.utc)
    await task.save()
    return task


async def delete_task(task_id: str, owner_id: str) -> bool:
    task = await get_task(task_id, owner_id)
    if not task:
        return False
    await task.delete()
    return True


async def complete_task(task_id: str, owner_id: str) -> Optional[Task]:
    task = await get_task(task_id, owner_id)
    if not task:
        return None
    task.is_completed = True
    task.status = TaskStatus.completed
    task.updated_at = datetime.now(timezone.utc)
    await task.save()
    return task
