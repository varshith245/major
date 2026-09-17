import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
import os
import pytest
from fastapi.testclient import TestClient
# App import moved into client fixture
# mongodb_manager will be imported inside init_test_db fixture
import mongomock

# Fixture to set up test MongoDB using mongomock before any imports that might create connections
@pytest.fixture(autouse=True)
def init_test_db(monkeypatch):
    # Override env vars to avoid real DB
    monkeypatch.setenv("MONGODB_URI", "")
    monkeypatch.setenv("MONGODB_DB_NAME", "test_db")

    # Create mongomock client and DB (fresh in‑memory instance per test)
    mock_client = mongomock.MongoClient()
    mock_db = mock_client["test_db"]

    # Import the singleton manager INSIDE the fixture so the env override is
    # already in effect when the module is first loaded.
    from backend.app.database.mongodb import mongodb_manager

    # Inject mock client into the manager – replaces any real Atlas connection
    mongodb_manager.client = mock_client
    mongodb_manager.db = mock_db
    mongodb_manager.is_connected = True
    mongodb_manager.fs = None
    # Seed collections with sample data for two users
    # User A data
    user_a_id = "user_a"
    # Insert a full Scheme document for saved schemes and views
    saved_scheme = {
        "scheme_id": "SCHEME1",
        "user_id": user_a_id,
        "scheme_name": "Synthetic Test Scheme",
        "short_name": "STS",
        "ministry": "Synthetic Ministry",
        "category": "Synthetic Category",
        "description": "A synthetic test scheme for unit testing.",
        "key_benefits": "Benefit description",
        "benefit_amount": 1000.0,
        "eligibility_criteria": {
            "min_age": 18,
            "max_age": 65,
            "gender": "Any",
            "occupation": [],
            "max_annual_income": None,
            "landholding_required": False,
            "landholding_max_acres": None,
            "caste_category": ["General", "OBC", "SC", "ST", "EWS"],
            "target_group": None,
            "exclusions": []
        },
        "application_link": "https://example.com/apply",
        "required_documents": [],
        "optional_documents": [],
        "offline_process": None,
        "status": "Active",
        "verification_status": "Verified"
    }
    mock_db["saved_schemes"].insert_one(saved_scheme)
    mock_db["scheme_views"].insert_one(saved_scheme)
    # Insert a complete EligibilityResult document for eligibility history
    mock_db["eligibility_history"].insert_one({
        "user_id": user_a_id,
        "scheme_id": "SCHEME1",
        "scheme_name": "Synthetic Test Scheme",
        "short_name": "STS",
        "category": "Synthetic Category",
        "benefit_amount": 1000.0,
        "eligibility_status": "Eligible",
        "confidence_score": 0.95,
        "is_eligible": True,
        "reasons": ["All criteria met"],
        "missing_criteria": [],
        "required_documents": [],
        "application_link": "https://example.com/apply",
        "offline_process": None
    })
    mock_db["checklist_progress"].insert_one({
        "user_id": user_a_id,
        "scheme_id": "SCHEME1",
        "scheme_name": "Synthetic Test Scheme",
        "mandatory_documents": ["ID Proof"],
        "optional_documents": [],
        "step_by_step_process": ["Step 1: Fill application", "Step 2: Upload documents"],
        "estimated_processing_days": 15,
        "official_portal": "https://example.com/apply",
        "helpline": "1800-000-0000"
    })
    mock_db["application_journey"].insert_one({"user_id": user_a_id, "scheme_id": "SCHEME1", "scheme_name": "Test Scheme", "current_stage": "Submitted", "stage_order": 1})
    mock_db["notifications"].insert_one({"user_id": user_a_id, "message": "Your application is pending", "created_at": "2024-01-01T00:00:00Z"})
    mock_db["chat_history"].insert_one({
        "user_id": user_a_id,
        "query": "How to apply?",
        "detected_language": "en",
        "intent": "general_inquiry",
        "confidence": 0.95,
        "answer": "Visit the portal",
        "timestamp": "2024-01-01T00:00:00Z"
    })
    # Schemes collection for deadline test – include a future deadline
    from datetime import datetime, timedelta
    future = (datetime.utcnow() + timedelta(days=10)).isoformat()
    # Full Scheme document for upcoming deadline test
    mock_db["schemes"].insert_one({
        "scheme_id": "SCHEME1",
        "user_id": user_a_id,
        "application_deadline": future,
        "scheme_name": "Synthetic Test Scheme",
        "short_name": "STS",
        "ministry": "Synthetic Ministry",
        "category": "Synthetic Category",
        "description": "A synthetic test scheme for deadline testing.",
        "key_benefits": "Benefit description",
        "benefit_amount": 1000.0,
        "eligibility_criteria": {
            "min_age": 18,
            "max_age": 65,
            "gender": "Any",
            "occupation": [],
            "max_annual_income": None,
            "landholding_required": False,
            "landholding_max_acres": None,
            "caste_category": ["General", "OBC", "SC", "ST", "EWS"],
            "target_group": None,
            "exclusions": []
        },
        "application_link": "https://example.com/apply",
        "required_documents": [],
        "optional_documents": [],
        "offline_process": None,
        "status": "Active",
        "verification_status": "Verified"
    })
    yield

@pytest.fixture
def client():
    from backend.app.main import app
    return TestClient(app)

@pytest.fixture
def auth_header():
    from backend.app.services.auth_service import auth_service
    def _make(user_id: str, role: str = "user", email: str = "test@example.com"):
        payload = {"sub": user_id, "user_id": user_id, "email": email, "role": role, "full_name": "Test User"}
        token = auth_service.create_access_token(payload)
        return {"Authorization": f"Bearer {token}"}
    return _make
