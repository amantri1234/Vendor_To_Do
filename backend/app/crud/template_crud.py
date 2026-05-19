from typing import Optional, List
from bson import ObjectId
from bson.errors import InvalidId
from app.models.models import Template, TemplateTaskEmbedded, Task
from app.schemas.schemas import TemplateCreate


async def get_templates(owner_id: str) -> List[Template]:
    return (
        await Template.find(Template.owner_id == owner_id)
        .sort(-Template.created_at)
        .to_list()
    )


async def get_template(template_id: str, owner_id: str) -> Optional[Template]:
    try:
        obj_id = ObjectId(template_id)
    except InvalidId:
        return None
    return await Template.find_one(
        Template.id == obj_id,
        Template.owner_id == owner_id,
    )


async def create_template(template_data: TemplateCreate, owner_id: str) -> Template:
    template_tasks = [
        TemplateTaskEmbedded(**t.model_dump())
        for t in template_data.tasks
    ]
    template = Template(
        name=template_data.name,
        description=template_data.description,
        owner_id=owner_id,
        tasks=template_tasks,
    )
    await template.insert()
    return template


async def delete_template(template_id: str, owner_id: str) -> bool:
    template = await get_template(template_id, owner_id)
    if not template:
        return False
    await template.delete()
    return True


async def create_tasks_from_template(template_id: str, owner_id: str) -> Optional[List[Task]]:
    template = await get_template(template_id, owner_id)
    if not template:
        return None
    if not template.tasks:
        return []
    tasks = []
    for tt in template.tasks:
        task = Task(
            title=tt.title,
            description=tt.description,
            priority=tt.priority.value if hasattr(tt.priority, 'value') else tt.priority,
            owner_id=owner_id,
        )
        await task.insert()
        tasks.append(task)
    return tasks
