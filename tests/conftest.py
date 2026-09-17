"""
Shared test fixtures for the tests/ directory.

This conftest sets up a mongomock-based in-memory MongoDB client BEFORE any
application code is imported, ensuring that:
  - No connection attempt is made to the production Atlas URI.
  - All MongoDB operations go through the mock client.
  - Test data is fully isolated in memory and cleaned up automatically.
"""
import os
import sys

# --- Environment overrides MUST happen before any app import ---
# Force empty MONGODB_URI so that config.py will NOT load the real Atlas URI.
os.environ["MONGODB_URI"] = ""
os.environ["MONGODB_DB_NAME"] = "test_db"

# Ensure the project root is on sys.path for backend.* imports
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import pytest
import mongomock
from fastapi.testclient import TestClient


@pytest.fixture(autouse=True, scope="session")
def inject_mongomock():
    """Inject a single mongomock client into mongodb_manager for the entire
    test session.

    Session scope ensures that module-scoped seed fixtures (e.g. init_db_and_seed)
    persist their data across all tests.  Because mongomock lives entirely in
    memory, there is no risk of touching the production Atlas cluster.
    """
    mock_client = mongomock.MongoClient()
    mock_db = mock_client["test_db"]

    from backend.app.database.mongodb import mongodb_manager

    # Swap in the mock client
    mongodb_manager.client = mock_client
    mongodb_manager.db = mock_db
    mongodb_manager.is_connected = True
    mongodb_manager.fs = None  # GridFS not supported by mongomock

    yield mock_db

    # Cleanup is automatic: the dict-backed mongomock client is discarded
    # when it goes out of scope.


@pytest.fixture
def client():
    """FastAPI TestClient — imported lazily so that the mongomock injection
    in ``inject_mongomock`` is already active when the app starts up."""
    from backend.app.main import app
    return TestClient(app)


@pytest.fixture
def auth_header():
    """Factory fixture that produces Authorization headers for any user_id."""
    from backend.app.services.auth_service import auth_service

    def _make(user_id: str, role: str = "user", email: str = "test@example.com"):
        payload = {
            "sub": user_id,
            "user_id": user_id,
            "email": email,
            "role": role,
            "full_name": "Test User",
        }
        token = auth_service.create_access_token(payload)
        return {"Authorization": f"Bearer {token}"}
    return _make
