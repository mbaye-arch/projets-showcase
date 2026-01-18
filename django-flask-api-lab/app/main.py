from flask import Flask, jsonify, request

from app.task_service import ALLOWED_STATUSES, TaskService


def create_app() -> Flask:
    app = Flask(__name__)
    task_service = TaskService()

    @app.get("/health")
    def health():
        return jsonify({"status": "ok", "service": "django-flask-api-lab"})

    @app.get("/api/tasks")
    def list_tasks():
        status = request.args.get("status")
        if status and status not in ALLOWED_STATUSES:
            return jsonify({
                "error": "invalid_status",
                "allowed": sorted(ALLOWED_STATUSES),
            }), 400

        tasks = task_service.list_tasks(status=status)
        return jsonify({"items": tasks, "count": len(tasks)})

    @app.get("/api/tasks/<task_id>")
    def get_task(task_id: str):
        task = task_service.get_task(task_id)
        if task is None:
            return jsonify({"error": "task_not_found"}), 404

        return jsonify(task)

    @app.post("/api/tasks")
    def create_task():
        payload = request.get_json(silent=True) or {}
        task, errors = task_service.create_task(payload)

        if errors:
            return jsonify({"errors": errors}), 400

        return jsonify(task), 201

    @app.get("/api/stats")
    def stats():
        return jsonify(task_service.stats())

    @app.get("/api/docs")
    def docs():
        return jsonify({
            "service": "django-flask-api-lab",
            "endpoints": [
                {"method": "GET", "path": "/health", "description": "Healthcheck"},
                {"method": "GET", "path": "/api/tasks", "description": "Liste des tâches"},
                {"method": "GET", "path": "/api/tasks?status=open", "description": "Filtre par statut"},
                {"method": "GET", "path": "/api/tasks/<task_id>", "description": "Détail d'une tâche"},
                {"method": "GET", "path": "/api/stats", "description": "Statistiques"},
                {"method": "POST", "path": "/api/tasks", "description": "Création avec validation"},
            ],
        })

    return app


app = create_app()
