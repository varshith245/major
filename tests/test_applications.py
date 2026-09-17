import pytest
from backend.app.database.seeder import init_db_and_seed

@pytest.fixture(scope="module", autouse=True)
def seed_test_db():
    init_db_and_seed()
    yield

def _get_client():
    from fastapi.testclient import TestClient
    from backend.app.main import app
    return TestClient(app)

def login(email: str, password: str) -> str:
    c = _get_client()
    response = c.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, f"Login failed for {email}: {response.text}"
    return response.json()["access_token"]

@pytest.fixture
def citizen_a_token():
    return login("citizen@egovseva.gov.in", "Citizen@12345")

@pytest.fixture
def citizen_b_token():
    email = "citizen_b_apps@example.com"
    password = "SecurePass123!"
    reg_payload = {
        "email": email,
        "password": password,
        "full_name": "Citizen B Apps",
        "phone_number": "9876543219",
        "role": "user",
    }
    c = _get_client()
    c.post("/api/auth/register", json=reg_payload)
    return login(email, password)

@pytest.fixture
def admin_token():
    return login("admin@egovseva.gov.in", "Admin@12345")

def test_unauthenticated_applications_rejected():
    c = _get_client()
    # Unauthenticated POST
    res_post = c.post("/api/applications", json={"scheme_id": "GOI-AGRI-001", "scheme_name": "PM Kisan", "category": "Agriculture"})
    assert res_post.status_code == 401

    # Unauthenticated GET
    res_get = c.get("/api/applications")
    assert res_get.status_code == 401

    # Unauthenticated GET /:id
    res_get_id = c.get("/api/applications/APP-12345")
    assert res_get_id.status_code == 401

    # Unauthenticated PATCH /:id
    res_patch = c.patch("/api/applications/APP-12345", json={"notes": "test"})
    assert res_patch.status_code == 401

    # Unauthenticated DELETE /:id
    res_del = c.delete("/api/applications/APP-12345")
    assert res_del.status_code == 401

def test_citizen_cannot_self_assign_approved_or_rejected_on_submission(citizen_a_token):
    c = _get_client()
    headers = {"Authorization": f"Bearer {citizen_a_token}"}

    # Citizen cannot submit application as "Approved"
    res_approved = c.post("/api/applications", json={
        "scheme_id": "GOI-TEST-001",
        "scheme_name": "Fraudulent Auto-Approve Test",
        "category": "Test",
        "status": "Approved"
    }, headers=headers)
    assert res_approved.status_code == 403
    assert "cannot self-assign" in res_approved.json()["detail"]

    # Citizen cannot submit application as "Rejected"
    res_rejected = c.post("/api/applications", json={
        "scheme_id": "GOI-TEST-002",
        "scheme_name": "Fraudulent Auto-Reject Test",
        "category": "Test",
        "status": "Rejected"
    }, headers=headers)
    assert res_rejected.status_code == 403

    # Citizen cannot submit application as "Under Review"
    res_review = c.post("/api/applications", json={
        "scheme_id": "GOI-TEST-003",
        "scheme_name": "Fraudulent Review Test",
        "category": "Test",
        "status": "Under Review"
    }, headers=headers)
    assert res_review.status_code == 403

def test_submit_and_get_application(citizen_a_token):
    c = _get_client()
    headers = {"Authorization": f"Bearer {citizen_a_token}"}
    
    payload = {
        "scheme_id": "GOI-AGRI-001",
        "scheme_name": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
        "category": "Agriculture",
        "reference_no": "SEV-2026-7890",
        "portal_url": "https://pmkisan.gov.in",
        "notes": "Direct transfer registration"
    }
    
    res = c.post("/api/applications", json=payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["scheme_id"] == "GOI-AGRI-001"
    assert data["reference_no"] == "SEV-2026-7890"
    assert data["status"] == "Submitted"
    assert data["current_stage"] == "Application Submitted"
    assert data["stage_order"] == 1
    app_id = data["id"]
    
    # Get all applications
    res_list = c.get("/api/applications", headers=headers)
    assert res_list.status_code == 200
    apps = res_list.json()
    assert any(a["id"] == app_id for a in apps)

    # Get single application
    res_single = c.get(f"/api/applications/{app_id}", headers=headers)
    assert res_single.status_code == 200
    assert res_single.json()["id"] == app_id

def test_journey_sync(citizen_a_token):
    """Verifies that submitting an application automatically reflects in /dashboard/journey."""
    c = _get_client()
    headers = {"Authorization": f"Bearer {citizen_a_token}"}
    
    res_journey = c.get("/dashboard/journey", headers=headers)
    assert res_journey.status_code == 200
    journey_list = res_journey.json()
    assert any(j["scheme_id"] == "GOI-AGRI-001" and j["current_stage"] == "Application Submitted" for j in journey_list)

def test_citizen_cannot_modify_official_status_or_stage(citizen_a_token):
    """Ordinary citizens cannot change status to Approved, Rejected, or Under Review, nor alter official stages."""
    c = _get_client()
    headers = {"Authorization": f"Bearer {citizen_a_token}"}
    
    # Submit first
    payload = {
        "scheme_id": "GOI-HLTH-002",
        "scheme_name": "Ayushman Bharat PM-JAY",
        "category": "Healthcare",
    }
    res = c.post("/api/applications", json=payload, headers=headers)
    assert res.status_code == 201
    app_id = res.json()["id"]
    
    # Citizen attempt to self-approve
    res_approve = c.patch(f"/api/applications/{app_id}", json={"status": "Approved"}, headers=headers)
    assert res_approve.status_code == 403
    assert "Only authorized administrators can update status" in res_approve.json()["detail"]

    # Citizen attempt to reject
    res_reject = c.patch(f"/api/applications/{app_id}", json={"status": "Rejected"}, headers=headers)
    assert res_reject.status_code == 403

    # Citizen attempt to change status to Under Review
    res_review = c.patch(f"/api/applications/{app_id}", json={"status": "Under Review"}, headers=headers)
    assert res_review.status_code == 403

    # Citizen attempt to advance official workflow stage
    res_stage = c.patch(f"/api/applications/{app_id}", json={
        "current_stage": "Sanctioned & Direct Benefit Disbursed",
        "stage_order": 3
    }, headers=headers)
    assert res_stage.status_code == 403

def test_citizen_can_update_personal_notes(citizen_a_token):
    """Citizens are allowed to annotate their own application with personal notes."""
    c = _get_client()
    headers = {"Authorization": f"Bearer {citizen_a_token}"}
    
    payload = {
        "scheme_id": "GOI-DOC-003",
        "scheme_name": "Document Tracking Scheme",
        "category": "Social",
    }
    res = c.post("/api/applications", json=payload, headers=headers)
    assert res.status_code == 201
    app_id = res.json()["id"]

    res_patch = c.patch(f"/api/applications/{app_id}", json={
        "notes": "Submitted physical photocopies at the Bangalore One center on 15th."
    }, headers=headers)
    assert res_patch.status_code == 200
    assert res_patch.json()["notes"] == "Submitted physical photocopies at the Bangalore One center on 15th."

def test_admin_can_update_status_and_journey_syncs(citizen_a_token, admin_token):
    """Only authorized administrators can update application status to Approved or Under Review."""
    c = _get_client()
    headers_citizen = {"Authorization": f"Bearer {citizen_a_token}"}
    headers_admin = {"Authorization": f"Bearer {admin_token}"}
    
    # Citizen A submits
    payload = {
        "scheme_id": "GOI-ADMIN-004",
        "scheme_name": "Senior Pension Test",
        "category": "Pension",
    }
    res = c.post("/api/applications", json=payload, headers=headers_citizen)
    assert res.status_code == 201
    app_id = res.json()["id"]

    # Admin reviews and approves
    admin_patch = {
        "status": "Approved",
        "current_stage": "Sanctioned & Direct Benefit Disbursed",
        "stage_order": 3,
        "notes": "Verified by Nodal Officer - Approved for DBT disbursement."
    }
    res_admin = c.patch(f"/api/applications/{app_id}", json=admin_patch, headers=headers_admin)
    assert res_admin.status_code == 200
    updated = res_admin.json()
    assert updated["status"] == "Approved"
    assert updated["current_stage"] == "Sanctioned & Direct Benefit Disbursed"

    # Citizen checks journey and sees official approved stage
    res_journey = c.get("/dashboard/journey", headers=headers_citizen)
    assert res_journey.status_code == 200
    journey_list = res_journey.json()
    assert any(j["scheme_id"] == "GOI-ADMIN-004" and j["current_stage"] == "Sanctioned & Direct Benefit Disbursed" for j in journey_list)

    # Verify audit log entry was recorded in the database
    res_audit = c.get("/api/admin/audit-logs?resource=Application", headers=headers_admin)
    assert res_audit.status_code == 200
    logs = res_audit.json()["logs"]
    assert any(l["action"] == "UPDATE_APPLICATION_STATUS" and l["resource_id"] == app_id for l in logs)

def test_application_data_isolation(citizen_a_token, citizen_b_token):
    """Verifies that Citizen B cannot view, update, or delete Citizen A's application."""
    c = _get_client()
    headers_a = {"Authorization": f"Bearer {citizen_a_token}"}
    headers_b = {"Authorization": f"Bearer {citizen_b_token}"}
    
    # Citizen A submits
    res_a = c.post("/api/applications", json={
        "scheme_id": "GOI-EDU-005",
        "scheme_name": "National Scholarship Portal",
        "category": "Education"
    }, headers=headers_a)
    assert res_a.status_code == 201
    app_id = res_a.json()["id"]
    
    # 1. Citizen B cannot view Citizen A's application (404)
    res_b_get = c.get(f"/api/applications/{app_id}", headers=headers_b)
    assert res_b_get.status_code == 404
    
    # 2. Citizen B cannot update Citizen A's application (404)
    res_b_patch = c.patch(f"/api/applications/{app_id}", json={"notes": "Hacked note"}, headers=headers_b)
    assert res_b_patch.status_code == 404

    # 3. Citizen B cannot delete Citizen A's application (404)
    res_b_delete = c.delete(f"/api/applications/{app_id}", headers=headers_b)
    assert res_b_delete.status_code == 404

    # 4. Citizen B's list does not show Citizen A's application
    res_b_list = c.get("/api/applications", headers=headers_b)
    assert res_b_list.status_code == 200
    assert not any(a["id"] == app_id for a in res_b_list.json())

    # 5. Citizen A can still view their own application
    res_a_get = c.get(f"/api/applications/{app_id}", headers=headers_a)
    assert res_a_get.status_code == 200
    assert res_a_get.json()["id"] == app_id

def test_delete_application(citizen_a_token):
    c = _get_client()
    headers = {"Authorization": f"Bearer {citizen_a_token}"}
    
    res = c.post("/api/applications", json={
        "scheme_id": "GOI-TEST-999",
        "scheme_name": "Temporary Test Scheme",
        "category": "Test"
    }, headers=headers)
    assert res.status_code == 201
    app_id = res.json()["id"]
    
    # Delete
    res_del = c.delete(f"/api/applications/{app_id}", headers=headers)
    assert res_del.status_code == 200
    
    # Verify not found
    res_check = c.get(f"/api/applications/{app_id}", headers=headers)
    assert res_check.status_code == 404

def test_admin_can_view_and_delete_citizen_application(citizen_a_token, admin_token):
    """Admin has explicit oversight: can view all applications and delete if required."""
    c = _get_client()
    headers_citizen = {"Authorization": f"Bearer {citizen_a_token}"}
    headers_admin = {"Authorization": f"Bearer {admin_token}"}

    # Citizen A submits
    res_a = c.post("/api/applications", json={
        "scheme_id": "GOI-ADMIN-DEL",
        "scheme_name": "Admin Oversight Test",
        "category": "Test"
    }, headers=headers_citizen)
    assert res_a.status_code == 201
    app_id = res_a.json()["id"]

    # Admin can view Citizen A's application
    res_admin_view = c.get(f"/api/applications/{app_id}", headers=headers_admin)
    assert res_admin_view.status_code == 200
    assert res_admin_view.json()["id"] == app_id

    # Admin can list all applications
    res_admin_list = c.get("/api/applications", headers=headers_admin)
    assert res_admin_list.status_code == 200
    assert any(a["id"] == app_id for a in res_admin_list.json())

    # Admin can delete the application
    res_admin_del = c.delete(f"/api/applications/{app_id}", headers=headers_admin)
    assert res_admin_del.status_code == 200

    # Verify delete audit log entry was recorded
    res_audit = c.get("/api/admin/audit-logs?resource=Application", headers=headers_admin)
    assert res_audit.status_code == 200
    logs = res_audit.json()["logs"]
    assert any(l["action"] == "DELETE_APPLICATION" and l["resource_id"] == app_id for l in logs)

    # Ensure it is gone
    res_after = c.get(f"/api/applications/{app_id}", headers=headers_citizen)
    assert res_after.status_code == 404

def test_stage_order_bounds_validation(citizen_a_token, admin_token):
    """Verifies that stage_order is strictly validated to range [1, 5] on both submit and patch."""
    c = _get_client()
    headers_citizen = {"Authorization": f"Bearer {citizen_a_token}"}
    headers_admin = {"Authorization": f"Bearer {admin_token}"}

    # stage_order = 0 is invalid
    res_zero = c.post("/api/applications", json={
        "scheme_id": "GOI-VALIDATE-0",
        "scheme_name": "Validation Scheme",
        "category": "Test",
        "stage_order": 0
    }, headers=headers_citizen)
    assert res_zero.status_code == 422

    # stage_order = 6 is invalid
    res_six = c.post("/api/applications", json={
        "scheme_id": "GOI-VALIDATE-6",
        "scheme_name": "Validation Scheme",
        "category": "Test",
        "stage_order": 6
    }, headers=headers_citizen)
    assert res_six.status_code == 422

    # stage_order = 5 is valid
    res_valid = c.post("/api/applications", json={
        "scheme_id": "GOI-VALIDATE-5",
        "scheme_name": "Validation Scheme",
        "category": "Test",
        "stage_order": 5
    }, headers=headers_citizen)
    assert res_valid.status_code == 201
    app_id = res_valid.json()["id"]

    # Admin patch with stage_order > 5 is invalid
    res_patch_invalid = c.patch(f"/api/applications/{app_id}", json={
        "stage_order": 7
    }, headers=headers_admin)
    assert res_patch_invalid.status_code == 422

    # Admin patch with valid stage_order = 4 is valid
    res_patch_valid = c.patch(f"/api/applications/{app_id}", json={
        "stage_order": 4
    }, headers=headers_admin)
    assert res_patch_valid.status_code == 200
    assert res_patch_valid.json()["stage_order"] == 4
