from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.models.models import Template, TemplateTask, Task
from app.schemas.schemas import TemplateCreate


def get_templates(db: Session, owner_id: int) -> List[Template]:
    # joinedload avoids N+1: fetches template_tasks in a single JOIN query
    return (
        db.query(Template)
        .options(joinedload(Template.template_tasks))
        .filter(Template.owner_id == owner_id)
        .order_by(Template.created_at.desc())
        .all()
    )


def get_template(db: Session, template_id: int, owner_id: int) -> Optional[Template]:
    return (
        db.query(Template)
        .options(joinedload(Template.template_tasks))
        .filter(Template.id == template_id, Template.owner_id == owner_id)
        .first()
    )


def create_template(db: Session, template_data: TemplateCreate, owner_id: int) -> Template:
    db_template = Template(
        name=template_data.name,
        description=template_data.description,
        owner_id=owner_id,
    )
    db.add(db_template)
    db.flush()  # get id before inserting child rows

    if template_data.tasks:
        db.bulk_insert_mappings(
            TemplateTask,
            [
                {**t.model_dump(), "template_id": db_template.id}
                for t in template_data.tasks
            ],
        )

    db.commit()
    # Re-fetch with joined tasks to return complete object
    return get_template(db, db_template.id, owner_id)


def delete_template(db: Session, template_id: int, owner_id: int) -> bool:
    deleted = (
        db.query(Template)
        .filter(Template.id == template_id, Template.owner_id == owner_id)
        .delete(synchronize_session="fetch")
    )
    db.commit()
    return deleted > 0


def create_tasks_from_template(db: Session, template_id: int, owner_id: int) -> Optional[List[Task]]:
    template = get_template(db, template_id, owner_id)
    if not template:
        return None   # caller raises 404

    if not template.template_tasks:
        return []

    # Bulk insert all tasks in one round-trip
    task_mappings = [
        {
            "title":       tt.title,
            "description": tt.description,
            "priority":    tt.priority,
            "owner_id":    owner_id,
        }
        for tt in template.template_tasks  # already ordered by TemplateTask.order via relationship
    ]
    db.bulk_insert_mappings(Task, task_mappings)
    db.commit()

    # Return the newly created tasks ordered by insertion
    return (
        db.query(Task)
        .filter(Task.owner_id == owner_id)
        .order_by(Task.id.desc())
        .limit(len(task_mappings))
        .all()[::-1]
    )
