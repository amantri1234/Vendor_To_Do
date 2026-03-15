from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.core.security import get_current_user
from app.models.models import User
from app.schemas.schemas import TemplateCreate, TemplateOut, TaskOut
from app.crud import template_crud

router = APIRouter(prefix="/templates", tags=["Templates"])


@router.get("", response_model=List[TemplateOut])
def list_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return template_crud.get_templates(db, current_user.id)


@router.post("", response_model=TemplateOut, status_code=status.HTTP_201_CREATED)
def create_template(
    template_data: TemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return template_crud.create_template(db, template_data, current_user.id)


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted = template_crud.delete_template(db, template_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")


@router.post("/{template_id}/create-tasks", response_model=List[TaskOut])
def create_tasks_from_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Single query that validates ownership + fetches tasks together
    tasks = template_crud.create_tasks_from_template(db, template_id, current_user.id)
    if tasks is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    return tasks
