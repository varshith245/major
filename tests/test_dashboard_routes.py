# tests/test_dashboard_routes.py
"""Backend tests for the Citizen Dashboard API routes.
These tests validate:
- Successful retrieval of each dashboard feature for an authenticated citizen.
- Unauthenticated access is rejected (401).
- A citizen cannot access another citizen's data (data isolation).
- Admin users cannot access citizen-only routes (403).
The tests use an in-memory mongomock database injected by conftest.py.
"""

import os
import pytest
from datetime import datetime, timedelta

# NOTE: app / mongodb_manager are NOT imported at module level.
# They are imported inside fixtures and helpers AFTER conftest.py has
# injected the mongomock client and overridden the environment.


@pytest.fixture(scope="module", autouse=True)
def seed_test_db():
    """Seed the (already-injected) mongomock database with initial data.
    No drop_database calls — mongomock is ephemeral and in-memory."""
    from backend.app.database.seeder import init_db_and_seed
    init_db_and_seed()
    yield
    # No cleanup needed: mongomock data is discarded automatically.


def _get_client():
    """Return a TestClient — imported lazily."""
    from fastapi.testclient import TestClient
    from backend.app.main import app
    return TestClient(app)


def login(email: str, password: str) -> str:
    c = _get_client()
    response = c.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, f"Login failed for {email}: {response.text}"
    return response.json()["access_token"]


# Helper to insert test documents for a given user_id
def insert_fixture(collection_name: str, user_id: str, docs: list):
    from backend.app.database.mongodb import mongodb_manager
    col = mongodb_manager.get_db()[collection_name]
    for doc in docs:
        doc["user_id"] = user_id
        col.insert_one(doc.copy())

@pytest.fixture
def citizen_a_token():
    return login("citizen@egovseva.gov.in", "Citizen@12345")

@pytest.fixture
def citizen_b_token():
    # Register a second citizen dynamically
    email = "citizenb_test@example.com"
    password = "SecurePass123!"
    reg_payload = {
        "email": email,
        "password": password,
        "full_name": "Citizen B",
        "phone_number": "9876543210",
        "role": "user",
    }
    c = _get_client()
    res = c.post("/api/auth/register", json=reg_payload)
    assert res.status_code in (201, 400)
    return login(email, password)

@pytest.fixture
def admin_token():
    return login("admin@egovseva.gov.in", "Admin@12345")

def test_unauthenticated_access_returns_401():
    endpoints = [
        "/dashboard/saved-schemes",
        "/dashboard/recent-views",
        "/dashboard/eligibility-history",
        "/dashboard/checklist-progress",
        "/dashboard/journey",
        "/dashboard/upcoming-deadlines",
        "/dashboard/notifications",
        "/dashboard/recent-chat",
    ]
    c = _get_client()
    for ep in endpoints:
        resp = c.get(ep)
        assert resp.status_code == 401

def test_admin_cannot_access_citizen_routes(admin_token):
    c = _get_client()
    headers = {"Authorization": f"Bearer {admin_token}"}
    resp = c.get("/dashboard/saved-schemes", headers=headers)
    assert resp.status_code == 403

def _get_user_id_from_token(token: str) -> str:
    from backend.app.services.auth_service import auth_service
    payload = auth_service.decode_access_token(token)
    return payload.get("user_id") or payload.get("sub")


def test_saved_schemes(citizen_a_token, citizen_b_token):
    # Insert distinct saved schemes for each citizen
    user_a_id = _get_user_id_from_token(citizen_a_token)
    user_b_id = _get_user_id_from_token(citizen_b_token)
    insert_fixture("saved_schemes", user_a_id, [{"scheme_name": "Scheme A"}])
    insert_fixture("saved_schemes", user_b_id, [{"scheme_name": "Scheme B"}])

    # Citizen A sees only Scheme A
    c = _get_client()
    headers_a = {"Authorization": f"Bearer {citizen_a_token}"}
    resp_a = c.get("/dashboard/saved-schemes", headers=headers_a)
    assert resp_a.status_code == 200
    data_a = resp_a.json()
    assert any(s["scheme_name"] == "Scheme A" for s in data_a)
    assert not any(s["scheme_name"] == "Scheme B" for s in data_a)

    # Citizen B sees only Scheme B
    headers_b = {"Authorization": f"Bearer {citizen_b_token}"}
    resp_b = c.get("/dashboard/saved-schemes", headers=headers_b)
    assert resp_b.status_code == 200
    data_b = resp_b.json()
    assert any(s["scheme_name"] == "Scheme B" for s in data_b)
    assert not any(s["scheme_name"] == "Scheme A" for s in data_b)

@pytest.mark.parametrize(
    "endpoint,collection,doc_template",
    [
        ("/dashboard/recent-views", "scheme_views", {"scheme_name": "Viewed Scheme", "viewed_at": datetime.utcnow().isoformat()}),
        ("/dashboard/eligibility-history", "eligibility_history", {"scheme_name": "Eligibility Scheme", "evaluated_at": datetime.utcnow().isoformat(), "eligible": True}),
        ("/dashboard/checklist-progress", "checklist_progress", {"checklist_name": "Doc Checklist", "completed": False}),
        ("/dashboard/journey", "application_journey", {"stage_name": "Submission", "stage_order": 1}),
        ("/dashboard/notifications", "notifications", {"title": "New Notification", "message": "Test", "created_at": datetime.utcnow().isoformat()}),
        ("/dashboard/recent-chat", "chat_history", {"message": "Hello", "timestamp": datetime.utcnow().isoformat()}),
    ],
)
def test_individual_route(endpoint, collection, doc_template, citizen_a_token, citizen_b_token):
    # Insert a distinct document for each citizen
    user_a_id = _get_user_id_from_token(citizen_a_token)
    user_b_id = _get_user_id_from_token(citizen_b_token)
    doc_a = doc_template.copy()
    doc_b = doc_template.copy()
    insert_fixture(collection, user_a_id, [doc_a])
    insert_fixture(collection, user_b_id, [doc_b])

    # Citizen A should only see its own document
    c = _get_client()
    headers_a = {"Authorization": f"Bearer {citizen_a_token}"}
    resp_a = c.get(endpoint, headers=headers_a)
    assert resp_a.status_code == 200
    data_a = resp_a.json()
    assert any(all(k in d and d[k] == v for k, v in doc_a.items()) for d in data_a)
    assert not any(all(k in d and d[k] == v for k, v in doc_b.items()) for d in data_a)

    # Citizen B should only see its own document
    headers_b = {"Authorization": f"Bearer {citizen_b_token}"}
    resp_b = c.get(endpoint, headers=headers_b)
    assert resp_b.status_code == 200
    data_b = resp_b.json()
    assert any(all(k in d and d[k] == v for k, v in doc_b.items()) for d in data_b)
    assert not any(all(k in d and d[k] == v for k, v in doc_a.items()) for d in data_b)

def test_upcoming_deadlines(citizen_a_token):
    from backend.app.database.mongodb import mongodb_manager
    now = datetime.utcnow()
    within = now + timedelta(days=5)
    outside = now + timedelta(days=60)
    scheme_col = mongodb_manager.get_db()["schemes"]
    scheme_col.insert_one({"scheme_name": "Soon Deadline", "application_deadline": within.isoformat()})
    scheme_col.insert_one({"scheme_name": "Later Deadline", "application_deadline": outside.isoformat()})

    c = _get_client()
    headers = {"Authorization": f"Bearer {citizen_a_token}"}
    resp = c.get("/dashboard/upcoming-deadlines", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    names = [s.get("scheme_name") for s in data]
    assert "Soon Deadline" in names
    assert "Later Deadline" not in names

def test_language_preference_update(citizen_a_token):
    from backend.app.database.mongodb import mongodb_manager
    c = _get_client()
    headers = {"Authorization": f"Bearer {citizen_a_token}"}
    resp = c.patch("/dashboard/language-preference", params={"language": "es"}, headers=headers)
    assert resp.status_code == 200
    json_data = resp.json()
    assert json_data.get("success") is True
    users_col = mongodb_manager.get_db()["users"]
    user_doc = users_col.find_one({"email": "citizen@egovseva.gov.in"})
    assert user_doc.get("preferred_language") == "es"
