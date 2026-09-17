import pytest

def _get_client():
    from fastapi.testclient import TestClient
    from backend.app.main import app
    return TestClient(app)


def _get_tokens():
    # Admin token
    admin_res = _get_client().post("/api/auth/login", json={"email": "admin@egovseva.gov.in", "password": "Admin@12345"})
    admin_token = admin_res.json()["access_token"]
    admin_id = admin_res.json()["user"]["user_id"]

    # Citizen token
    citizen_res = _get_client().post("/api/auth/login", json={"email": "citizen@egovseva.gov.in", "password": "Citizen@12345"})
    citizen_token = citizen_res.json()["access_token"]
    citizen_id = citizen_res.json()["user"]["user_id"]

    return {
        "admin_token": admin_token,
        "admin_id": admin_id,
        "citizen_token": citizen_token,
        "citizen_id": citizen_id
    }

def test_unauthenticated_admin_route_rejected():
    res = _get_client().get("/api/admin/dashboard")
    assert res.status_code == 401

def test_citizen_cannot_access_admin_dashboard():
    tokens = _get_tokens()
    headers = {"Authorization": f"Bearer {tokens['citizen_token']}"}
    res = _get_client().get("/api/admin/dashboard", headers=headers)
    assert res.status_code == 403
    assert "Access denied" in res.json()["detail"]

def test_admin_can_access_dashboard_with_kpi_and_charts():
    tokens = _get_tokens()
    headers = {"Authorization": f"Bearer {tokens['admin_token']}"}
    res = _get_client().get("/api/admin/dashboard", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "kpi" in data
    assert "charts" in data
    assert data["kpi"]["total_schemes"] >= 30
    assert data["kpi"]["system_health"] == "Operational"
    assert "eligibility_distribution" in data["charts"]
    assert "language_distribution" in data["charts"]

def test_admin_system_health():
    tokens = _get_tokens()
    headers = {"Authorization": f"Bearer {tokens['admin_token']}"}
    res = _get_client().get("/api/admin/system-health", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "services" in data
    assert len(data["services"]) >= 6

def test_admin_scheme_crud_lifecycle():
    tokens = _get_tokens()
    headers = {"Authorization": f"Bearer {tokens['admin_token']}"}

    # 1. Create
    new_scheme_payload = {
        "scheme_name": "National Digital Literacy Mission 2026",
        "short_name": "NDLM-2026",
        "ministry": "Ministry of Electronics and Information Technology",
        "level": "Central",
        "state": "All-India",
        "category": "Education & Skills",
        "description": "Empowering citizens with foundational AI and digital literacy certification.",
        "key_benefits": "Free certification and computer kit subsidy",
        "benefit_amount": 5000.0,
        "eligibility_criteria": {
            "min_age": 14,
            "max_age": 60,
            "gender": "Any",
            "occupation": ["Student", "Any"],
            "max_annual_income": 300000.0,
            "landholding_required": False,
            "caste_category": ["General", "OBC", "SC", "ST", "EWS"],
            "exclusions": []
        },
        "required_documents": ["Aadhaar Card", "School / College ID"],
        "optional_documents": ["Income Certificate"],
        "application_link": "https://meity.gov.in/ndlm",
        "processing_time_days": 10,
        "tags": ["digital", "ai", "skills", "students"],
        "status": "Active"
    }
    create_res = _get_client().post("/api/admin/schemes", headers=headers, json=new_scheme_payload)
    assert create_res.status_code == 201
    created_scheme = create_res.json()["scheme"]
    scheme_id = created_scheme["scheme_id"]

    # 2. Read
    get_res = _get_client().get(f"/api/schemes/{scheme_id}")
    assert get_res.status_code == 200
    assert get_res.json()["short_name"] == "NDLM-2026"

    # 3. Status Toggle to Inactive
    patch_res = _get_client().patch(f"/api/admin/schemes/{scheme_id}/status", headers=headers, json={"status": "Inactive"})
    assert patch_res.status_code == 200
    assert patch_res.json()["scheme"]["status"] == "Inactive"

    # 4. Update
    new_scheme_payload["benefit_amount"] = 7500.0
    put_res = _get_client().put(f"/api/admin/schemes/{scheme_id}", headers=headers, json=new_scheme_payload)
    assert put_res.status_code == 200
    assert put_res.json()["scheme"]["benefit_amount"] == 7500.0

def test_admin_eligibility_rule_tester():
    tokens = _get_tokens()
    headers = {"Authorization": f"Bearer {tokens['admin_token']}"}

    test_payload = {
        "scheme_id": "PM-KISAN",
        "age": 35,
        "gender": "Male",
        "state": "Karnataka",
        "occupation": "Farmer",
        "annual_income": 100000.0,
        "owns_land": True,
        "landholding_acres": 2.0,
        "caste_category": "OBC"
    }
    res = _get_client().post("/api/admin/eligibility-rules/test", headers=headers, json=test_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "Eligible"
    assert data["confidence_score"] >= 0.90
    assert len(data["matched_criteria"]) > 0

def test_admin_audit_logs_and_settings():
    tokens = _get_tokens()
    headers = {"Authorization": f"Bearer {tokens['admin_token']}"}

    # Audit logs
    logs_res = _get_client().get("/api/admin/audit-logs", headers=headers)
    assert logs_res.status_code == 200
    assert "logs" in logs_res.json()

    # Settings read
    settings_res = _get_client().get("/api/admin/settings", headers=headers)
    assert settings_res.status_code == 200
    assert "app_name" in settings_res.json()

    # Settings update
    update_res = _get_client().put("/api/admin/settings", headers=headers, json={"maintenance_mode": False})
    assert update_res.status_code == 200
    assert update_res.json()["success"] is True
