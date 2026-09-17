import pytest
from backend.app.services.auth_service import auth_service
from backend.app.database.seeder import init_db_and_seed

def _get_client():
    from fastapi.testclient import TestClient
    from backend.app.main import app
    return TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    init_db_and_seed()

def test_bcrypt_password_hashing_and_verification():
    raw_password = "SecretPassword@2026"
    hashed = auth_service.hash_password(raw_password)
    
    assert hashed != raw_password
    assert hashed.startswith("$2b$") or hashed.startswith("$2a$")
    assert auth_service.verify_password(raw_password, hashed) is True
    assert auth_service.verify_password("WrongPassword", hashed) is False

def test_jwt_token_generation_and_decoding():
    payload = {
        "sub": "USR-TEST1234",
        "email": "testuser@egovseva.gov.in",
        "role": "user",
        "full_name": "Test Citizen"
    }
    token = auth_service.create_access_token(payload)
    assert isinstance(token, str)
    assert len(token) > 20

    decoded = auth_service.decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "USR-TEST1234"
    assert decoded["email"] == "testuser@egovseva.gov.in"
    assert decoded["role"] == "user"

def test_admin_seed_login():
    # Login as seeded default Admin
    login_payload = {
        "email": "admin@egovseva.gov.in",
        "password": "Admin@12345"
    }
    res = _get_client().post("/api/auth/login", json=login_payload)
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"
    assert data["user"]["email"] == "admin@egovseva.gov.in"

def test_citizen_seed_login():
    # Login as seeded demo Citizen
    login_payload = {
        "email": "citizen@egovseva.gov.in",
        "password": "Citizen@12345"
    }
    res = _get_client().post("/api/auth/login", json=login_payload)
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "user"

def test_invalid_login_credentials():
    login_payload = {
        "email": "admin@egovseva.gov.in",
        "password": "WrongPassword123"
    }
    res = _get_client().post("/api/auth/login", json=login_payload)
    assert res.status_code == 401
    assert "Invalid email or password" in res.json()["detail"]

def test_citizen_registration_and_me_endpoint():
    unique_email = "newcitizen_test@egovseva.gov.in"
    reg_payload = {
        "email": unique_email,
        "password": "SecurePassword@123",
        "full_name": "Suresh Gowda",
        "phone_number": "9123456789",
        "role": "user"
    }
    # Register
    res = _get_client().post("/api/auth/register", json=reg_payload)
    if res.status_code == 400 and "already registered" in res.json()["detail"]:
        # If already exists from earlier test run, log in
        login_res = _get_client().post("/api/auth/login", json={"email": unique_email, "password": "SecurePassword@123"})
        token = login_res.json()["access_token"]
    else:
        assert res.status_code == 201
        token = res.json()["access_token"]

    # Test /api/auth/me with Bearer token
    headers = {"Authorization": f"Bearer {token}"}
    me_res = _get_client().get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == unique_email

def test_unauthenticated_me_rejected():
    res = _get_client().get("/api/auth/me")
    assert res.status_code == 401

def test_rbac_citizen_cannot_access_admin_routes():
    # Login as citizen
    login_res = _get_client().post("/api/auth/login", json={"email": "citizen@egovseva.gov.in", "password": "Citizen@12345"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt to access admin-only users list
    res = _get_client().get("/api/auth/admin/users", headers=headers)
    assert res.status_code == 403
    assert "Access denied" in res.json()["detail"]

def test_rbac_admin_can_access_admin_routes():
    # Login as admin
    login_res = _get_client().post("/api/auth/login", json={"email": "admin@egovseva.gov.in", "password": "Admin@12345"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Access admin users list
    res = _get_client().get("/api/auth/admin/users", headers=headers)
    assert res.status_code == 200
    assert "users" in res.json()
    assert res.json()["total"] >= 2

    # Access admin stats
    stats_res = _get_client().get("/api/auth/admin/stats", headers=headers)
    assert stats_res.status_code == 200
    assert "total_registered_users" in stats_res.json()
