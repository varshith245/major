import pytest
import io

# NOTE: Do NOT import app or create TestClient at module level.
# conftest.py must inject the mongomock client first.

def _get_client():
    from fastapi.testclient import TestClient
    from backend.app.main import app
    return TestClient(app)

def test_database_seeded_properly():
    from backend.app.database.seeder import init_db_and_seed
    from backend.app.database.connection import SessionLocal
    from backend.app.database.models import SchemeDB, EligibilityRuleDB
    init_db_and_seed()
    db = SessionLocal()
    try:
        count = db.query(SchemeDB).count()
        assert count >= 30, f"Expected >= 30 schemes in DB, found {count}"
        
        rules_count = db.query(EligibilityRuleDB).count()
        assert rules_count >= 30
        
        pm_kisan = db.query(SchemeDB).filter(SchemeDB.short_name == "PM-KISAN").first()
        assert pm_kisan is not None
        assert pm_kisan.benefit_amount == 6000
    finally:
        db.close()

def test_stats_dashboard_endpoint():
    c = _get_client()
    res = c.get("/api/stats/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert data["total_schemes"] >= 30
    assert data["central_schemes_count"] > 0
    assert data["state_schemes_count"] > 0
    assert len(data["categories"]) > 0
    assert data["total_benefit_pool"] > 0
    assert "cloudinary_storage_active" in data

def test_eligibility_simulation_endpoint():
    payload = {
        "base_profile": {
            "age": 30,
            "gender": "Male",
            "state": "Karnataka",
            "occupation": "Farmer",
            "annual_income": 100000,
            "owns_land": True,
            "landholding_acres": 2.0,
            "caste_category": "General",
            "is_govt_employee": False,
            "is_income_tax_payer": False
        },
        "modified_fields": {
            "is_income_tax_payer": True
        }
    }
    c = _get_client()
    res = c.post("/api/eligibility/simulate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["original_eligible_count"] > data["simulated_eligible_count"]
    assert "PM-KISAN" in data["newly_ineligible_schemes"]

def _get_citizen_token():
    from backend.app.services.auth_service import auth_service
    return auth_service.create_access_token({"sub": "USR-CITIZEN01", "user_id": "USR-CITIZEN01", "role": "user"})

def test_document_upload_endpoint_validation():
    # Test invalid file format rejection
    file_bytes = b"fake binary content"
    files = {"file": ("test.exe", file_bytes, "application/x-msdownload")}
    data = {"document_type": "Income Certificate", "scheme_id": "GOI-AGRI-001"}
    
    token = _get_citizen_token()
    c = _get_client()
    res = c.post("/api/documents/upload", files=files, data=data, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 400
    assert "Invalid file type" in res.json()["detail"]

def test_document_upload_and_retrieve_mongodb():
    from backend.app.database.mongodb import mongodb_manager
    if not mongodb_manager.is_connected:
        pytest.skip("MongoDB Atlas cluster not connected in offline test environment")

    # Test valid document upload to MongoDB Atlas
    pdf_content = b"%PDF-1.4 Mock Government Certificate Content"
    files = {"file": ("aadhaar_test.pdf", pdf_content, "application/pdf")}
    data = {"document_type": "Aadhaar Card", "scheme_id": "GOI-AGRI-001"}

    token = _get_citizen_token()
    c = _get_client()
    res = c.post("/api/documents/upload", files=files, data=data, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    res_data = res.json()
    assert res_data["success"] is True
    assert res_data["storage_provider"] == "MongoDB Atlas"
    assert res_data["file_id"] is not None

    # Test file retrieval from MongoDB Atlas
    file_id = res_data["file_id"]
    get_res = c.get(f"/api/documents/file/{file_id}", headers={"Authorization": f"Bearer {token}"})
    assert get_res.status_code == 200
    assert get_res.content == pdf_content


