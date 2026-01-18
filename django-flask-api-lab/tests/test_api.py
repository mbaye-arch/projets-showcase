from app.main import create_app


def test_health_endpoint():
    client = create_app().test_client()

    response = client.get("/health")

    assert response.status_code == 200
    assert response.get_json()["status"] == "ok"


def test_list_tasks():
    client = create_app().test_client()

    response = client.get("/api/tasks")
    payload = response.get_json()

    assert response.status_code == 200
    assert payload["count"] == 5
    assert payload["items"][0]["id"] == "T001"


def test_filter_tasks_by_status():
    client = create_app().test_client()

    response = client.get("/api/tasks?status=open")
    payload = response.get_json()

    assert response.status_code == 200
    assert payload["count"] == 2
    assert all(task["status"] == "open" for task in payload["items"])


def test_filter_tasks_rejects_unknown_status():
    client = create_app().test_client()

    response = client.get("/api/tasks?status=blocked")
    payload = response.get_json()

    assert response.status_code == 400
    assert payload["error"] == "invalid_status"
    assert "open" in payload["allowed"]


def test_get_unknown_task_returns_404():
    client = create_app().test_client()

    response = client.get("/api/tasks/UNKNOWN")

    assert response.status_code == 404
    assert response.get_json()["error"] == "task_not_found"


def test_create_task_validation():
    client = create_app().test_client()

    response = client.post("/api/tasks", json={"title": "Missing fields"})

    assert response.status_code == 400
    assert "owner" in response.get_json()["errors"]


def test_create_task_success():
    client = create_app().test_client()

    response = client.post(
        "/api/tasks",
        json={
            "title": "Prepare deployment",
            "owner": "Amina",
            "status": "open",
            "priority": "high",
        },
    )

    payload = response.get_json()

    assert response.status_code == 201
    assert payload["id"] == "T006"
    assert payload["title"] == "Prepare deployment"


def test_docs_endpoint():
    client = create_app().test_client()

    response = client.get("/api/docs")
    payload = response.get_json()

    assert response.status_code == 200
    assert payload["service"] == "django-flask-api-lab"
    assert len(payload["endpoints"]) >= 6
