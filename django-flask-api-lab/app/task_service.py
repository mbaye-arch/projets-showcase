from __future__ import annotations

from dataclasses import dataclass, asdict
from itertools import count
from typing import Any


ALLOWED_STATUSES = {"open", "in_progress", "done"}
ALLOWED_PRIORITIES = {"low", "medium", "high"}


@dataclass
class Task:
    id: str
    title: str
    owner: str
    status: str
    priority: str

    def to_dict(self) -> dict[str, str]:
        return asdict(self)


class TaskService:
    def __init__(self) -> None:
        self._counter = count(start=6)
        self._tasks = [
            Task("T001", "Prepare KPI dataset", "Amina", "done", "high"),
            Task("T002", "Review API documentation", "Karim", "in_progress", "medium"),
            Task("T003", "Create dashboard mockup", "Sophie", "open", "medium"),
            Task("T004", "Validate deployment checklist", "Moussa", "open", "high"),
            Task("T005", "Write project README", "Nadia", "done", "low"),
        ]

    def list_tasks(self, status: str | None = None) -> list[dict[str, str]]:
        tasks = self._tasks

        if status:
            tasks = [task for task in tasks if task.status == status]

        return [task.to_dict() for task in tasks]

    def get_task(self, task_id: str) -> dict[str, str] | None:
        for task in self._tasks:
            if task.id == task_id:
                return task.to_dict()

        return None

    def create_task(self, payload: dict[str, Any]) -> tuple[dict[str, str] | None, dict[str, str]]:
        errors = self._validate(payload)
        if errors:
            return None, errors

        task = Task(
            id=f"T{next(self._counter):03d}",
            title=str(payload["title"]).strip(),
            owner=str(payload["owner"]).strip(),
            status=str(payload["status"]).strip(),
            priority=str(payload["priority"]).strip(),
        )
        self._tasks.append(task)

        return task.to_dict(), {}

    def stats(self) -> dict[str, Any]:
        total = len(self._tasks)
        by_status = {status: 0 for status in sorted(ALLOWED_STATUSES)}
        by_priority = {priority: 0 for priority in sorted(ALLOWED_PRIORITIES)}

        for task in self._tasks:
            by_status[task.status] += 1
            by_priority[task.priority] += 1

        return {
            "total": total,
            "by_status": by_status,
            "by_priority": by_priority,
        }

    def _validate(self, payload: dict[str, Any]) -> dict[str, str]:
        errors: dict[str, str] = {}

        for field in ["title", "owner", "status", "priority"]:
            if not str(payload.get(field, "")).strip():
                errors[field] = "required"

        status = str(payload.get("status", "")).strip()
        priority = str(payload.get("priority", "")).strip()

        if status and status not in ALLOWED_STATUSES:
            errors["status"] = f"must be one of {sorted(ALLOWED_STATUSES)}"

        if priority and priority not in ALLOWED_PRIORITIES:
            errors["priority"] = f"must be one of {sorted(ALLOWED_PRIORITIES)}"

        return errors

