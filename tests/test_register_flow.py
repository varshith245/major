import time
import pytest
from backend.app.services.otp_service import otp_service

def _get_client():
    from fastapi.testclient import TestClient
    from backend.app.main import app
    return TestClient(app)


def test_full_ordered_registration_workflow():
    """
    Tests user's exact required sequence:
    1. First register with OTP (send OTP & verify code to get verification token)
    2. Then password set (register with verification token & set secure password)
    3. Then sign in (login with credentials in exact order)
    """
    test_email = f"citizen_{int(time.time())}@egovseva.gov.in"
    password = "CitizenSecure@2026"
    full_name = "Varshith D"
    
    # -------------------------------------------------------------
    # STEP 1: REGISTER WITH OTP
    # -------------------------------------------------------------
    # 1a. Citizen enters details and requests OTP
    send_res = _get_client().post("/api/auth/otp/send", json={
        "identifier": test_email,
        "purpose": "register"
    })
    assert send_res.status_code == 200
    send_data = send_res.json()
    assert send_data["success"] is True
    
    # Retrieve the generated OTP directly from OTP service for the test
    key = otp_service._get_key(test_email, "register")
    assert key in otp_service._active_otps
    otp_code = otp_service._active_otps[key]["otp_code"]
    assert len(otp_code) == 6

    # 1b. Citizen verifies OTP code
    verify_res = _get_client().post("/api/auth/otp/verify", json={
        "identifier": test_email,
        "otp_code": otp_code,
        "purpose": "register"
    })
    assert verify_res.status_code == 200
    verify_data = verify_res.json()
    assert verify_data["verified"] is True
    assert "verification_token" in verify_data
    verification_token = verify_data["verification_token"]
    assert verification_token.startswith("VTOK-")

    # -------------------------------------------------------------
    # STEP 2: PASSWORD SET
    # -------------------------------------------------------------
    # Citizen sets password with verified token and completes registration
    reg_payload = {
        "email": test_email,
        "password": password,
        "full_name": full_name,
        "verification_token": verification_token,
        "phone_number": "9845012345",
        "role": "user",
        "state": "Karnataka",
        "preferred_language": "en"
    }
    reg_res = _get_client().post("/api/auth/otp/register", json=reg_payload)
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert reg_data["user"]["email"] == test_email
    assert reg_data["user"]["full_name"] == full_name
    assert reg_data["user"]["user_profile"]["state"] == "Karnataka"

    # -------------------------------------------------------------
    # STEP 3: SIGN IN
    # -------------------------------------------------------------
    # Citizen logs in using newly established password
    login_res = _get_client().post("/api/auth/login", json={
        "email": test_email,
        "password": password
    })
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    assert login_data["user"]["email"] == test_email
    assert login_data["user"]["full_name"] == full_name
    assert login_data["user"]["role"] == "user"

    # 3b. Verify authenticated citizen profile access with Bearer token
    token = login_data["access_token"]
    me_res = _get_client().get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == test_email
    assert me_data["full_name"] == full_name
