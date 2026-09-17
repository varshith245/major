import pytest
import time
from backend.app.services.otp_service import otp_service

def _get_client():
    from fastapi.testclient import TestClient
    from backend.app.main import app
    return TestClient(app)


def test_send_otp_success_for_existing_citizen():
    payload = {
        "identifier": "citizen@egovseva.gov.in",
        "purpose": "login"
    }
    res = _get_client().post("/api/auth/otp/send", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["expires_in_seconds"] == 300

def test_send_otp_unregistered_account_fails_for_login():
    payload = {
        "identifier": "unregistered999@domain.gov.in",
        "purpose": "login"
    }
    res = _get_client().post("/api/auth/otp/send", json=payload)
    assert res.status_code == 404
    assert "No registered citizen or admin account found" in res.json()["detail"]

def test_verify_otp_valid_and_invalid_codes():
    email = "test_verify_user@egovseva.gov.in"
    send_res = otp_service.send_otp(email, purpose="verify")
    key = otp_service._get_key(email, "verify")
    valid_code = otp_service._active_otps[key]["otp_code"]

    # 1. Test invalid code
    bad_res = _get_client().post("/api/auth/otp/verify", json={
        "identifier": email,
        "otp_code": "000000",
        "purpose": "verify"
    })
    assert bad_res.status_code == 400
    assert "Invalid OTP code" in bad_res.json()["detail"]

    # 2. Test valid code
    ok_res = _get_client().post("/api/auth/otp/verify", json={
        "identifier": email,
        "otp_code": valid_code,
        "purpose": "verify"
    })
    assert ok_res.status_code == 200
    assert ok_res.json()["verified"] is True
    assert ok_res.json()["verification_token"] is not None

def test_otp_login_flow():
    email = "citizen@egovseva.gov.in"
    send_res = otp_service.send_otp(email, purpose="login", force_resend=True)
    key = otp_service._get_key(email, "login")
    valid_code = otp_service._active_otps[key]["otp_code"]

    # Login with OTP
    login_res = _get_client().post("/api/auth/otp/login", json={
        "identifier": email,
        "otp_code": valid_code
    })
    assert login_res.status_code == 200
    data = login_res.json()
    assert "access_token" in data
    assert data["user"]["email"] == email
    assert data["user"]["role"] == "user"

def test_otp_register_flow():
    unique_email = "new_otp_citizen@egovseva.gov.in"
    send_res = otp_service.send_otp(unique_email, purpose="register")
    key = otp_service._get_key(unique_email, "register")
    valid_code = otp_service._active_otps[key]["otp_code"]

    reg_payload = {
        "email": unique_email,
        "password": "SecurePassword@123",
        "full_name": "Gowri Shankar",
        "phone_number": "9845012345",
        "role": "user",
        "otp_code": valid_code
    }
    reg_res = _get_client().post("/api/auth/otp/register", json=reg_payload)
    assert reg_res.status_code == 201
    data = reg_res.json()
    assert "access_token" in data
    assert data["user"]["email"] == unique_email
    assert data["user"]["full_name"] == "Gowri Shankar"

def test_otp_brute_force_lockout():
    email = "lockout_test@egovseva.gov.in"
    otp_service.send_otp(email, purpose="verify")

    # Try 3 wrong attempts
    for _ in range(3):
        _get_client().post("/api/auth/otp/verify", json={
            "identifier": email,
            "otp_code": "999999",
            "purpose": "verify"
        })

    # 4th attempt should indicate lockout
    fourth_res = _get_client().post("/api/auth/otp/verify", json={
        "identifier": email,
        "otp_code": "999999",
        "purpose": "verify"
    })
    assert fourth_res.status_code == 400
    assert "invalidated" in fourth_res.json()["detail"] or "No active OTP" in fourth_res.json()["detail"]
