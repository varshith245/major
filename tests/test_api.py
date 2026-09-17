import pytest

def _get_client():
    from fastapi.testclient import TestClient
    from backend.app.main import app
    return TestClient(app)


def test_root_and_health():
    res = _get_client().get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"
    assert data["total_schemes_loaded"] >= 30

    res_h = _get_client().get("/api/health")
    assert res_h.status_code == 200
    assert res_h.json()["status"] == "healthy"

def test_get_schemes():
    res = _get_client().get("/api/schemes")
    assert res.status_code == 200
    schemes = res.json()
    assert len(schemes) >= 30

    res_filter = _get_client().get("/api/schemes?category=Agriculture")
    assert res_filter.status_code == 200
    assert len(res_filter.json()) >= 3

def test_eligibility_evaluation_endpoint():
    payload = {
        "age": 30,
        "gender": "Male",
        "state": "Karnataka",
        "occupation": "Farmer",
        "annual_income": 80000,
        "owns_land": True,
        "landholding_acres": 2.0,
        "caste_category": "OBC",
        "is_govt_employee": False,
        "is_income_tax_payer": False
    }
    res = _get_client().post("/api/eligibility/evaluate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["total_evaluated"] >= 30
    assert data["eligible_count"] >= 1
    assert any(r["short_name"] == "PM-KISAN" and r["is_eligible"] for r in data["results"])

def test_chat_endpoint():
    res = _get_client().post("/api/chat", json={"query": "What documents for Ayushman card?"})
    assert res.status_code == 200
    data = res.json()
    assert data["intent"] == "document_query"
    assert len(data["matched_schemes"]) >= 1

def test_checklist_endpoint():
    res = _get_client().post("/api/checklist/generate", json={"scheme_id": "GOI-AGRI-001"})
    assert res.status_code == 200
    data = res.json()
    assert "Aadhaar Card" in data["mandatory_documents"]
    assert len(data["step_by_step_process"]) >= 4

def test_comparison_endpoint():
    res = _get_client().post("/api/comparison/compare", json={"scheme_ids": ["GOI-HOUS-003", "GOI-HOUS-004"]})
    assert res.status_code == 200
    data = res.json()
    assert len(data["schemes"]) == 2
    assert "PMAY-G" in data["comparison_fields"]["short_names"]
    assert "PMAY-U" in data["comparison_fields"]["short_names"]
