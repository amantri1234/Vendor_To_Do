from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List
from app.core.security import get_current_user
from app.core.rate_limit import limiter
from app.models.models import User
from app.schemas.schemas import TemplateCreate, TemplateOut, TaskOut
from app.crud import template_crud

router = APIRouter(prefix="/templates", tags=["Templates"])


def _template_to_out(t: any) -> TemplateOut:
    data = t.model_dump()
    data["template_tasks"] = data.pop("tasks", [])
    return TemplateOut.model_validate(data)


def _task_to_out(t: any) -> TaskOut:
    return TaskOut.model_validate(t.model_dump())


@router.get("", response_model=List[TemplateOut])
async def list_templates(current_user: User = Depends(get_current_user)):
    templates = await template_crud.get_templates(str(current_user.id))
    return [_template_to_out(t) for t in templates]


@router.post("", response_model=TemplateOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
async def create_template(
    request: Request,
    template_data: TemplateCreate,
    current_user: User = Depends(get_current_user),
):
    template = await template_crud.create_template(template_data, str(current_user.id))
    return _template_to_out(template)


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
async def delete_template(
    request: Request,
    template_id: str,
    current_user: User = Depends(get_current_user),
):
    deleted = await template_crud.delete_template(template_id, str(current_user.id))
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")


@router.post("/{template_id}/create-tasks", response_model=List[TaskOut])
@limiter.limit("30/minute")
async def create_tasks_from_template(
    request: Request,
    template_id: str,
    current_user: User = Depends(get_current_user),
):
    tasks = await template_crud.create_tasks_from_template(template_id, str(current_user.id))
    if tasks is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    return [_task_to_out(t) for t in tasks]
