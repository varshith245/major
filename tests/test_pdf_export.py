import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.auth_service import auth_service

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def citizen_a_token():
    return auth_service.create_access_token({
        "sub": "USR-CITIZEN-PDF-A",
        "user_id": "USR-CITIZEN-PDF-A",
        "email": "citizen_a_pdf@test.gov.in",
        "role": "user"
    })

@pytest.fixture
def citizen_b_token():
    return auth_service.create_access_token({
        "sub": "USR-CITIZEN-PDF-B",
        "user_id": "USR-CITIZEN-PDF-B",
        "email": "citizen_b_pdf@test.gov.in",
        "role": "user"
    })

@pytest.fixture
def admin_token():
    return auth_service.create_access_token({
        "sub": "USR-ADMIN-PDF-01",
        "user_id": "USR-ADMIN-PDF-01",
        "email": "admin_pdf@egovseva.gov.in",
        "role": "admin"
    })


def test_unauthenticated_acknowledgment_pdf_denied(client):
    """Confirm unauthenticated request for acknowledgment PDF is rejected with 401."""
    res = client.get("/api/applications/APP-TEST-999/acknowledgment-pdf")
    assert res.status_code == 401


def test_citizen_can_download_own_acknowledgment_pdf(client, citizen_a_token):
    """Confirm a citizen can successfully generate and download their own application acknowledgment PDF."""
    auth_citizen = {"Authorization": f"Bearer {citizen_a_token}"}

    # Submit an application
    app_res = client.post("/api/applications", json={
        "scheme_id": "GOI-AGRI-001",
        "scheme_name": "PM Kisan Samman Nidhi",
        "category": "Agriculture",
        "reference_no": "PMK-ACK-001",
        "notes": "Self-applied via citizen assistant"
    }, headers=auth_citizen)
    assert app_res.status_code == 201
    app_id = app_res.json()["id"]

    # Request acknowledgment PDF
    pdf_res = client.get(f"/api/applications/{app_id}/acknowledgment-pdf", headers=auth_citizen)
    assert pdf_res.status_code == 200
    assert pdf_res.headers.get("content-type") == "application/pdf"
    assert "SEVA-Acknowledgment" in pdf_res.headers.get("content-disposition", "")
    assert pdf_res.content.startswith(b"%PDF-")
    assert len(pdf_res.content) > 1000


def test_cross_user_acknowledgment_pdf_denied(client, citizen_a_token, citizen_b_token):
    """Confirm Citizen B cannot access or download Citizen A's application acknowledgment PDF."""
    auth_a = {"Authorization": f"Bearer {citizen_a_token}"}
    auth_b = {"Authorization": f"Bearer {citizen_b_token}"}

    # Citizen A submits application
    app_res = client.post("/api/applications", json={
        "scheme_id": "GOI-HOUS-001",
        "scheme_name": "Pradhan Mantri Awas Yojana",
        "category": "Housing",
        "reference_no": "PMAY-ACK-002"
    }, headers=auth_a)
    assert app_res.status_code == 201
    app_id = app_res.json()["id"]

    # Citizen B attempts to download Citizen A's acknowledgment PDF -> 404
    tamper_res = client.get(f"/api/applications/{app_id}/acknowledgment-pdf", headers=auth_b)
    assert tamper_res.status_code == 404
    assert "Application not found" in tamper_res.json().get("detail", "")


def test_admin_can_download_any_citizen_acknowledgment_pdf(client, citizen_a_token, admin_token):
    """Confirm an authorized admin can download any citizen's application acknowledgment PDF."""
    auth_citizen = {"Authorization": f"Bearer {citizen_a_token}"}
    auth_admin = {"Authorization": f"Bearer {admin_token}"}

    # Citizen A submits application
    app_res = client.post("/api/applications", json={
        "scheme_id": "GOI-HLTH-001",
        "scheme_name": "Ayushman Bharat PM-JAY",
        "category": "Healthcare",
        "reference_no": "AB-PMJAY-003"
    }, headers=auth_citizen)
    assert app_res.status_code == 201
    app_id = app_res.json()["id"]

    # Admin downloads Citizen A's acknowledgment PDF -> 200
    admin_pdf_res = client.get(f"/api/applications/{app_id}/acknowledgment-pdf", headers=auth_admin)
    assert admin_pdf_res.status_code == 200
    assert admin_pdf_res.headers.get("content-type") == "application/pdf"
    assert admin_pdf_res.content.startswith(b"%PDF-")


def test_nonexistent_application_acknowledgment_pdf(client, citizen_a_token):
    """Confirm 404 is returned when attempting to download PDF for a non-existent application."""
    auth_citizen = {"Authorization": f"Bearer {citizen_a_token}"}
    res = client.get("/api/applications/APP-NONEXISTENT-9999/acknowledgment-pdf", headers=auth_citizen)
    assert res.status_code == 404


def test_scheme_comparison_pdf_generation(client):
    """Confirm scheme comparison PDF export works for valid scheme IDs via both POST and GET."""
    # POST endpoint
    post_res = client.post("/api/comparison/export-pdf", json={
        "scheme_ids": ["GOI-AGRI-001", "GOI-AGRI-002"]
    })
    assert post_res.status_code == 200
    assert post_res.headers.get("content-type") == "application/pdf"
    assert post_res.content.startswith(b"%PDF-")
    assert "SEVA-Scheme-Comparison" in post_res.headers.get("content-disposition", "")
    assert len(post_res.content) > 1000

    # GET endpoint
    get_res = client.get("/api/comparison/export-pdf?scheme_ids=GOI-AGRI-001,GOI-AGRI-002")
    assert get_res.status_code == 200
    assert get_res.headers.get("content-type") == "application/pdf"
    assert get_res.content.startswith(b"%PDF-")


def test_scheme_comparison_pdf_missing_or_invalid_schemes(client):
    """Confirm error handling when comparison PDF is requested with empty or non-existent scheme IDs."""
    # Empty list -> 400
    empty_res = client.post("/api/comparison/export-pdf", json={"scheme_ids": []})
    assert empty_res.status_code == 400

    # Non-existent schemes -> 400
    invalid_res = client.post("/api/comparison/export-pdf", json={"scheme_ids": ["FAKE-SCHEME-999", "NON-EXISTENT-888"]})
    assert invalid_res.status_code == 400
    assert "No active schemes found" in invalid_res.json().get("detail", "")

    # GET with blank scheme_ids -> 400
    get_blank = client.get("/api/comparison/export-pdf?scheme_ids=")
    assert get_blank.status_code == 400
