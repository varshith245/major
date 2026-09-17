import pytest
import datetime
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.auth_service import auth_service
from backend.app.services.mongodb_service import mongodb_service

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def citizen_a_token():
    return auth_service.create_access_token({
        "sub": "USR-CITIZEN-A",
        "user_id": "USR-CITIZEN-A",
        "email": "citizen_a@test.gov.in",
        "role": "user"
    })

@pytest.fixture
def citizen_b_token():
    return auth_service.create_access_token({
        "sub": "USR-CITIZEN-B",
        "user_id": "USR-CITIZEN-B",
        "email": "citizen_b@test.gov.in",
        "role": "user"
    })

@pytest.fixture
def admin_token():
    return auth_service.create_access_token({
        "sub": "USR-ADMIN001",
        "user_id": "USR-ADMIN001",
        "email": "admin@egovseva.gov.in",
        "role": "admin"
    })

def test_unauthenticated_document_access_denied(client):
    # Upload without token -> 401
    file_payload = {"file": ("aadhaar.pdf", b"%PDF-1.4 sample content", "application/pdf")}
    res = client.post("/api/documents/upload", files=file_payload, data={"document_type": "Aadhaar Card"})
    assert res.status_code == 401
    assert "Authentication required" in res.json().get("detail", "")

    # List without token -> 401
    res = client.get("/api/documents/list")
    assert res.status_code == 401

    # Download without token -> 401
    res = client.get("/api/documents/file/fake_file_id")
    assert res.status_code == 401

    # Delete without token -> 401
    res = client.delete("/api/documents/fake_file_id")
    assert res.status_code == 401

    # Preview token generation without auth -> 401
    res = client.post("/api/documents/fake_file_id/preview-token")
    assert res.status_code == 401

def test_citizen_document_lifecycle_and_ownership(client, citizen_a_token, citizen_b_token, admin_token):
    # 1. Citizen A uploads document to vault
    pdf_content = b"%PDF-1.4 Citizen A Aadhaar Card Content"
    file_payload = {"file": ("citizen_a_aadhaar.pdf", pdf_content, "application/pdf")}
    res = client.post(
        "/api/documents/upload",
        files=file_payload,
        data={"document_type": "Aadhaar Card", "scheme_id": "GOI-AGRI-001"},
        headers={"Authorization": f"Bearer {citizen_a_token}"}
    )
    assert res.status_code == 200
    upload_data = res.json()
    assert upload_data["success"] is True
    assert upload_data["user_id"] == "USR-CITIZEN-A"
    assert upload_data["file_id"] is not None
    file_id = upload_data["file_id"]

    # 2. Citizen A lists documents -> sees their document
    res_list_a = client.get("/api/documents/list", headers={"Authorization": f"Bearer {citizen_a_token}"})
    assert res_list_a.status_code == 200
    docs_a = res_list_a.json()
    assert any(d["file_id"] == file_id for d in docs_a)

    # 3. Citizen B lists documents -> does NOT see Citizen A's document
    res_list_b = client.get("/api/documents/list", headers={"Authorization": f"Bearer {citizen_b_token}"})
    assert res_list_b.status_code == 200
    docs_b = res_list_b.json()
    assert not any(d["file_id"] == file_id for d in docs_b)

    # 4. Cross-user download denial: Citizen B cannot download Citizen A's document (returns 404)
    res_get_b = client.get(
        f"/api/documents/file/{file_id}",
        headers={"Authorization": f"Bearer {citizen_b_token}"}
    )
    assert res_get_b.status_code == 404

    # 5. Citizen A downloads with Authorization: Bearer header -> 200
    res_get_a = client.get(
        f"/api/documents/file/{file_id}",
        headers={"Authorization": f"Bearer {citizen_a_token}"}
    )
    assert res_get_a.status_code == 200
    assert res_get_a.content == pdf_content

    # 6. SECURITY RULE: Long-lived access token in ?token= URL query param is strictly REJECTED
    res_get_long_lived_token = client.get(f"/api/documents/file/{file_id}?token={citizen_a_token}")
    assert res_get_long_lived_token.status_code == 401

    # 7. Short-lived preview token generation: Citizen A requests ticket
    res_ticket = client.post(
        f"/api/documents/{file_id}/preview-token",
        headers={"Authorization": f"Bearer {citizen_a_token}"}
    )
    assert res_ticket.status_code == 200
    ticket_data = res_ticket.json()
    assert ticket_data["success"] is True
    assert ticket_data["expires_in_seconds"] == 60
    preview_token = ticket_data["preview_token"]

    # 8. Citizen A previews with short-lived preview token -> 200
    res_get_preview = client.get(f"/api/documents/file/{file_id}?preview_token={preview_token}")
    assert res_get_preview.status_code == 200
    assert res_get_preview.content == pdf_content

    # 9. Token tampering: Preview token generated for file_id cannot be used on another file
    res_tampered = client.get(f"/api/documents/file/other_file_id?preview_token={preview_token}")
    assert res_tampered.status_code == 401

    # 10. Cross-user preview token generation denial: Citizen B cannot get a preview ticket for Citizen A's document
    res_ticket_b = client.post(
        f"/api/documents/{file_id}/preview-token",
        headers={"Authorization": f"Bearer {citizen_b_token}"}
    )
    assert res_ticket_b.status_code == 404

    # 11. Cross-user deletion denial: Citizen B tries to delete Citizen A's document -> 404
    res_del_b = client.delete(
        f"/api/documents/{file_id}",
        headers={"Authorization": f"Bearer {citizen_b_token}"}
    )
    assert res_del_b.status_code == 404

    # Verify document still exists for Citizen A
    res_list_a_after = client.get("/api/documents/list", headers={"Authorization": f"Bearer {citizen_a_token}"})
    assert any(d["file_id"] == file_id for d in res_list_a_after.json())

    # 12. Admin can access Citizen A's document for official scheme inspection
    res_get_admin = client.get(
        f"/api/documents/file/{file_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_get_admin.status_code == 200
    assert res_get_admin.content == pdf_content

    # 13. Citizen A successfully deletes their own document
    res_del_a = client.delete(
        f"/api/documents/{file_id}",
        headers={"Authorization": f"Bearer {citizen_a_token}"}
    )
    assert res_del_a.status_code == 200
    assert res_del_a.json()["success"] is True

    # 14. Document no longer in Citizen A's list and download returns 404
    res_list_a_empty = client.get("/api/documents/list", headers={"Authorization": f"Bearer {citizen_a_token}"})
    assert not any(d["file_id"] == file_id for d in res_list_a_empty.json())

    res_get_deleted = client.get(
        f"/api/documents/file/{file_id}",
        headers={"Authorization": f"Bearer {citizen_a_token}"}
    )
    assert res_get_deleted.status_code == 404

def test_legacy_unowned_document_protection(client, citizen_a_token, admin_token):
    """
    Verifies that legacy documents without an owner (user_id is None) are completely
    inaccessible to ordinary citizens (returns 404), while remaining accessible to admins.
    """
    # Inject a mock legacy file directly into storage without user_id
    legacy_content = b"%PDF-1.4 Legacy Government Circular Content"
    upload_res = mongodb_service.upload_document(
        file_content=legacy_content,
        filename="legacy_circular.pdf",
        document_type="Aadhaar Card",
        content_type="application/pdf",
        user_id=None  # Legacy anonymous file
    )
    assert upload_res["success"] is True
    legacy_id = upload_res["file_id"]

    # 1. Citizen A lists documents -> legacy unowned file must NOT appear
    res_list = client.get("/api/documents/list", headers={"Authorization": f"Bearer {citizen_a_token}"})
    assert res_list.status_code == 200
    assert not any(d["file_id"] == legacy_id for d in res_list.json())

    # 2. Citizen A tries to download legacy file -> 404
    res_get = client.get(f"/api/documents/file/{legacy_id}", headers={"Authorization": f"Bearer {citizen_a_token}"})
    assert res_get.status_code == 404

    # 3. Citizen A tries to delete legacy file -> 404
    res_del = client.delete(f"/api/documents/{legacy_id}", headers={"Authorization": f"Bearer {citizen_a_token}"})
    assert res_del.status_code == 404

    # 4. Citizen A tries to generate preview ticket for legacy file -> 404
    res_ticket = client.post(f"/api/documents/{legacy_id}/preview-token", headers={"Authorization": f"Bearer {citizen_a_token}"})
    assert res_ticket.status_code == 404

    # 5. Portal Admin can access legacy file for official audit/migration
    res_admin = client.get(f"/api/documents/file/{legacy_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_admin.status_code == 200
    assert res_admin.content == legacy_content

def test_backend_file_validation(client, citizen_a_token):
    # 1. Reject empty file
    res = client.post(
        "/api/documents/upload",
        files={"file": ("empty.pdf", b"", "application/pdf")},
        data={"document_type": "Aadhaar Card"},
        headers={"Authorization": f"Bearer {citizen_a_token}"}
    )
    assert res.status_code == 400
    assert "empty" in res.json().get("detail", "").lower()

    # 2. Reject file exceeding 10 MB limit
    large_content = b"0" * (10 * 1024 * 1024 + 1024)
    res = client.post(
        "/api/documents/upload",
        files={"file": ("oversized.pdf", large_content, "application/pdf")},
        data={"document_type": "Aadhaar Card"},
        headers={"Authorization": f"Bearer {citizen_a_token}"}
    )
    assert res.status_code == 400
    assert "exceeds the 10 MB limit" in res.json().get("detail", "")

    # 3. Reject disallowed MIME type (.bat)
    res = client.post(
        "/api/documents/upload",
        files={"file": ("malicious.bat", b"echo danger", "application/x-bat")},
        data={"document_type": "Income Certificate"},
        headers={"Authorization": f"Bearer {citizen_a_token}"}
    )
    assert res.status_code == 400
    assert "Invalid file type" in res.json().get("detail", "")

    # 4. Reject disallowed extension even if MIME is spoofed
    res = client.post(
        "/api/documents/upload",
        files={"file": ("malicious.exe", b"%PDF-fake", "application/pdf")},
        data={"document_type": "Income Certificate"},
        headers={"Authorization": f"Bearer {citizen_a_token}"}
    )
    assert res.status_code == 400
    assert "Invalid file extension" in res.json().get("detail", "")

    # 5. Reject forged binary magic bytes (MIME application/pdf but missing %PDF header)
    res = client.post(
        "/api/documents/upload",
        files={"file": ("forged.pdf", b"This is plain text pretending to be PDF", "application/pdf")},
        data={"document_type": "Aadhaar Card"},
        headers={"Authorization": f"Bearer {citizen_a_token}"}
    )
    assert res.status_code == 400
    assert "header signature" in res.json().get("detail", "").lower()
