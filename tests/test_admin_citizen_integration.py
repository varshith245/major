import pytest
from backend.app.database.connection import SessionLocal
from backend.app.database.models import SchemeDB, EligibilityRuleDB, SchemeDocumentDB

def _get_client():
    from fastapi.testclient import TestClient
    from backend.app.main import app
    return TestClient(app)


def test_admin_and_citizen_complete_integration():
    # 1. Citizen login & role verification
    citizen_res = _get_client().post("/api/auth/login", json={"email": "citizen@egovseva.gov.in", "password": "Citizen@12345"})
    assert citizen_res.status_code == 200
    citizen_data = citizen_res.json()
    assert citizen_data["user"]["role"] == "user"
    citizen_token = citizen_data["access_token"]
    citizen_headers = {"Authorization": f"Bearer {citizen_token}"}

    # 2. Admin login & role verification
    admin_res = _get_client().post("/api/auth/login", json={"email": "admin@egovseva.gov.in", "password": "Admin@12345"})
    assert admin_res.status_code == 200
    admin_data = admin_res.json()
    assert admin_data["user"]["role"] == "admin"
    admin_token = admin_data["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 3. Role-based Access Control: Citizen cannot call Admin Endpoints
    forbidden_dash = _get_client().get("/api/admin/dashboard", headers=citizen_headers)
    assert forbidden_dash.status_code == 403
    assert "Access denied" in forbidden_dash.json()["detail"]

    forbidden_post = _get_client().post("/api/admin/schemes", json={}, headers=citizen_headers)
    assert forbidden_post.status_code == 403

    forbidden_users = _get_client().get("/api/admin/users", headers=citizen_headers)
    assert forbidden_users.status_code == 403

    # 4. Admin creates a new Scheme
    test_scheme_id = "SCHEME-INT-TEST-99"
    new_scheme_payload = {
        "scheme_id": test_scheme_id,
        "scheme_name": "National Integrated Green Rooftop Subsidy Scheme",
        "short_name": "PM Green Rooftop",
        "ministry": "Ministry of New and Renewable Energy",
        "level": "Central",
        "state": "All-India",
        "category": "Clean Energy & Environment",
        "description": "Financial assistance of up to 40% for installation of residential rooftop solar panels.",
        "key_benefits": "Direct subsidy of ₹30,000 for 1-2kW systems and ₹60,000 for systems above 2kW.",
        "benefit_amount": 60000.0,
        "eligibility_criteria": {
            "min_age": 18,
            "max_age": 75,
            "gender": "Any",
            "max_annual_income": 800000.0,
            "landholding_required": False,
            "landholding_max_acres": None,
            "occupation": ["Any"],
            "caste_category": ["General", "OBC", "SC", "ST", "EWS"],
            "exclusions": ["Commercial establishments"]
        },
        "required_documents": [
            "Aadhaar Card of Property Owner",
            "Recent Electricity Bill with CA Number",
            "Proof of Roof Ownership"
        ],
        "optional_documents": [
            "Bank Account Passbook"
        ],
        "application_link": "https://solarrooftop.gov.in",
        "offline_process": "Visit local electricity distribution company (DISCOM) sub-division office.",
        "grievance_contact": "Toll Free: 1800-180-3333",
        "processing_time_days": 21,
        "tags": ["Solar", "Green Energy", "Rooftop", "Electricity Subsidy"],
        "status": "Active",
        "verification_status": "Verified",
        "source_url": "https://solarrooftop.gov.in"
    }

    create_res = _get_client().post("/api/admin/schemes", json=new_scheme_payload, headers=admin_headers)
    assert create_res.status_code == 201
    assert create_res.json()["success"] is True

    # 5. Verify persistence in Database Tables (SchemeDB, EligibilityRuleDB, SchemeDocumentDB)
    db = SessionLocal()
    try:
        db_scheme = db.query(SchemeDB).filter(SchemeDB.scheme_id == test_scheme_id).first()
        assert db_scheme is not None
        assert db_scheme.short_name == "PM Green Rooftop"
        assert db_scheme.category == "Clean Energy & Environment"

        db_rule = db.query(EligibilityRuleDB).filter(EligibilityRuleDB.scheme_id == test_scheme_id).first()
        assert db_rule is not None
        assert db_rule.min_age == 18
        assert db_rule.max_annual_income == 800000.0

        db_docs = db.query(SchemeDocumentDB).filter(SchemeDocumentDB.scheme_id == test_scheme_id).all()
        doc_names = [d.document_name for d in db_docs]
        assert "Aadhaar Card of Property Owner" in doc_names
        assert "Recent Electricity Bill with CA Number" in doc_names
    finally:
        db.close()

    # 6. Verify Citizen Endpoints reflect the newly created scheme
    # 6a. Citizen scheme catalog
    schemes_res = _get_client().get("/api/schemes")
    assert schemes_res.status_code == 200
    all_schemes = schemes_res.json()
    found = any(s["scheme_id"] == test_scheme_id for s in all_schemes)
    assert found is True, "Newly created scheme must appear in citizen schemes list"

    # 6b. Citizen scheme detail
    detail_res = _get_client().get(f"/api/schemes/{test_scheme_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["short_name"] == "PM Green Rooftop"

    # 6c. Citizen search
    search_res = _get_client().get("/api/schemes?search=Rooftop+Solar")
    assert search_res.status_code == 200
    search_results = search_res.json()
    assert any(s["scheme_id"] == test_scheme_id for s in search_results)

    # 6d. Citizen checklist generation
    chk_res = _get_client().post("/api/checklist/generate", json={"scheme_id": test_scheme_id})
    assert chk_res.status_code == 200
    chk_data = chk_res.json()
    assert "Recent Electricity Bill with CA Number" in chk_data["mandatory_documents"]

    # 6e. Citizen comparison
    cmp_res = _get_client().post("/api/comparison/compare", json={"scheme_ids": [test_scheme_id, "GOI-AGRI-001"]})
    assert cmp_res.status_code == 200
    cmp_data = cmp_res.json()
    assert "PM Green Rooftop" in cmp_data["comparison_fields"]["short_names"]

    # 7. Admin updates scheme status to 'Inactive'
    toggle_res = _get_client().patch(
        f"/api/admin/schemes/{test_scheme_id}/status",
        json={"status": "Inactive"},
        headers=admin_headers
    )
    assert toggle_res.status_code == 200
    assert toggle_res.json()["scheme"]["status"] == "Inactive"

    # 8. Verify Citizen Endpoints immediately HIDE the inactive scheme
    # 8a. Not in general catalog
    schemes_after_res = _get_client().get("/api/schemes")
    assert not any(s["scheme_id"] == test_scheme_id for s in schemes_after_res.json())

    # 8b. Returns 404 on detail lookup
    detail_inactive_res = _get_client().get(f"/api/schemes/{test_scheme_id}")
    assert detail_inactive_res.status_code == 404

    # 8c. Search excludes inactive scheme
    search_after_res = _get_client().get("/api/schemes?search=Rooftop+Solar")
    assert not any(s["scheme_id"] == test_scheme_id for s in search_after_res.json())

    # 8d. Comparison excludes inactive scheme
    cmp_after_res = _get_client().post("/api/comparison/compare", json={"scheme_ids": [test_scheme_id]})
    assert cmp_after_res.status_code == 400

    # 9. Clean up: Admin deletes the test scheme
    del_res = _get_client().delete(f"/api/admin/schemes/{test_scheme_id}", headers=admin_headers)
    assert del_res.status_code == 200
