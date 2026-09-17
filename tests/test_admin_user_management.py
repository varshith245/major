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

def test_citizen_cannot_update_user_role():
    tokens = _get_tokens()
    headers = {"Authorization": f"Bearer {tokens['citizen_token']}"}
    res = _get_client().patch(
        f"/api/auth/admin/users/{tokens['citizen_id']}/role",
        headers=headers,
        json={"role": "admin"}
    )
    assert res.status_code == 403
    assert "Access denied" in res.json()["detail"]

def test_admin_update_user_role():
    tokens = _get_tokens()
    headers = {"Authorization": f"Bearer {tokens['admin_token']}"}

    # Promote citizen to admin
    res = _get_client().patch(
        f"/api/auth/admin/users/{tokens['citizen_id']}/role",
        headers=headers,
        json={"role": "admin"}
    )
    assert res.status_code == 200
    assert res.json()["success"] is True
    assert res.json()["user"]["role"] == "admin"

    # Demote back to user
    demote_res = _get_client().patch(
        f"/api/auth/admin/users/{tokens['citizen_id']}/role",
        headers=headers,
        json={"role": "user"}
    )
    assert demote_res.status_code == 200
    assert demote_res.json()["user"]["role"] == "user"

def test_admin_cannot_self_demote():
    tokens = _get_tokens()
    headers = {"Authorization": f"Bearer {tokens['admin_token']}"}
    res = _get_client().patch(
        f"/api/auth/admin/users/{tokens['admin_id']}/role",
        headers=headers,
        json={"role": "user"}
    )
    assert res.status_code == 400
    assert "cannot demote their own account" in res.json()["detail"]

def test_admin_update_user_status():
    tokens = _get_tokens()
    headers = {"Authorization": f"Bearer {tokens['admin_token']}"}

    # Deactivate citizen account
    res = _get_client().patch(
        f"/api/auth/admin/users/{tokens['citizen_id']}/status",
        headers=headers,
        json={"is_active": False}
    )
    assert res.status_code == 200
    assert res.json()["user"]["is_active"] is False

    # Reactivate citizen account
    react_res = _get_client().patch(
        f"/api/auth/admin/users/{tokens['citizen_id']}/status",
        headers=headers,
        json={"is_active": True}
    )
    assert react_res.status_code == 200
    assert react_res.json()["user"]["is_active"] is True

def test_admin_create_and_delete_test_user():
    tokens = _get_tokens()
    headers = {"Authorization": f"Bearer {tokens['admin_token']}"}

    # Register a temporary user
    reg_res = _get_client().post(
        "/api/auth/register",
        json={
            "email": "temp_delete_test@egovseva.gov.in",
            "password": "Password@123",
            "full_name": "Temporary Citizen",
            "role": "user"
        }
    )
    assert reg_res.status_code == 201
    temp_user_id = reg_res.json()["user"]["user_id"]

    # Delete the temporary user
    del_res = _get_client().delete(f"/api/auth/admin/users/{temp_user_id}", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # Confirm user not found anymore
    get_res = _get_client().patch(
        f"/api/auth/admin/users/{temp_user_id}/status",
        headers=headers,
        json={"is_active": True}
    )
    assert get_res.status_code == 404
