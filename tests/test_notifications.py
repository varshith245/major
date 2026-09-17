import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.auth_service import auth_service
from backend.app.services.notification_service import notification_service

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def citizen_a_token():
    return auth_service.create_access_token({
        "sub": "USR-CITIZEN-NOTIF-A",
        "user_id": "USR-CITIZEN-NOTIF-A",
        "email": "citizen_a_notif@test.gov.in",
        "role": "user"
    })

@pytest.fixture
def citizen_b_token():
    return auth_service.create_access_token({
        "sub": "USR-CITIZEN-NOTIF-B",
        "user_id": "USR-CITIZEN-NOTIF-B",
        "email": "citizen_b_notif@test.gov.in",
        "role": "user"
    })

@pytest.fixture
def admin_token():
    return auth_service.create_access_token({
        "sub": "USR-ADMIN-NODAL-01",
        "user_id": "USR-ADMIN-NODAL-01",
        "email": "admin_nodal@egovseva.gov.in",
        "role": "admin"
    })

def test_unauthenticated_notification_endpoints(client):
    """Confirm all notification endpoints reject unauthenticated requests."""
    res = client.get("/api/notifications")
    assert res.status_code in [401, 403]

    res = client.get("/api/notifications/unread-count")
    assert res.status_code in [401, 403]

    res = client.patch("/api/notifications/NOTIF-FAKE-999/read")
    assert res.status_code in [401, 403]

    res = client.post("/api/notifications/mark-all-read")
    assert res.status_code in [401, 403]

    res = client.delete("/api/notifications/NOTIF-FAKE-999")
    assert res.status_code in [401, 403]


def test_admin_status_change_triggers_notification(client, citizen_a_token, admin_token):
    """Confirm changing an application status triggers an in-app and simulated multi-channel notification."""
    auth_citizen = {"Authorization": f"Bearer {citizen_a_token}"}
    auth_admin = {"Authorization": f"Bearer {admin_token}"}

    # Citizen submits application
    app_res = client.post("/api/applications", json={
        "scheme_id": "PM-KISAN-NOTIF",
        "scheme_name": "PM Kisan Samman Nidhi",
        "category": "Agriculture",
        "reference_no": "PMK-TEST-001"
    }, headers=auth_citizen)
    assert app_res.status_code == 201
    app_id = app_res.json()["id"]

    # Admin changes status to "Under Review"
    update_res = client.patch(f"/api/applications/{app_id}", json={
        "status": "Under Review",
        "current_stage": "Document Verification",
        "stage_order": 2,
        "notes": "Application accepted for scrutiny by nodal desk"
    }, headers=auth_admin)
    assert update_res.status_code == 200

    # Citizen checks notifications
    notif_res = client.get("/api/notifications", headers=auth_citizen)
    assert notif_res.status_code == 200
    notifs = notif_res.json()
    assert len(notifs) >= 1

    status_notif = next((n for n in notifs if n.get("application_id") == app_id and n.get("type") == "STATUS_UPDATE"), None)
    assert status_notif is not None
    assert "Under Review" in status_notif["title"]
    assert "PM Kisan Samman Nidhi" in status_notif["message"]
    assert status_notif["is_read"] is False
    assert "sms_simulated" in status_notif["channels_dispatched"]
    assert "email_simulated" in status_notif["channels_dispatched"]


def test_admin_document_request_triggers_notification(client, citizen_a_token, admin_token):
    """Confirm requesting missing documents triggers DOCUMENT_REQUEST alert with vault action link."""
    auth_citizen = {"Authorization": f"Bearer {citizen_a_token}"}
    auth_admin = {"Authorization": f"Bearer {admin_token}"}

    app_res = client.post("/api/applications", json={
        "scheme_id": "PMAY-NOTIF-02",
        "scheme_name": "Pradhan Mantri Awas Yojana",
        "category": "Housing",
        "reference_no": "PMAY-TEST-002"
    }, headers=auth_citizen)
    assert app_res.status_code == 201
    app_id = app_res.json()["id"]

    # Admin requests missing documents
    update_res = client.patch(f"/api/applications/{app_id}", json={
        "action_type": "DOCUMENT_REQUEST",
        "status": "Under Review",
        "current_stage": "Documents Requested",
        "missing_documents": ["Land Deed / 7-12 Extract", "Latest Income Certificate"],
        "notes": "Please provide clearer copies with official seal"
    }, headers=auth_admin)
    assert update_res.status_code == 200

    # Citizen inspects notifications
    notif_res = client.get("/api/notifications", headers=auth_citizen)
    assert notif_res.status_code == 200
    notifs = notif_res.json()

    doc_notif = next((n for n in notifs if n.get("application_id") == app_id and n.get("type") == "DOCUMENT_REQUEST"), None)
    assert doc_notif is not None
    assert "Action Required: Missing Documents" in doc_notif["title"]
    assert "Land Deed" in doc_notif["message"]
    assert "/dashboard?tab=vault" in doc_notif["action_url"]
    assert doc_notif["is_read"] is False


def test_admin_benefit_sanction_triggers_notification(client, citizen_a_token, admin_token):
    """Confirm benefit sanction recording dispatches BENEFIT_SANCTION notification."""
    auth_citizen = {"Authorization": f"Bearer {citizen_a_token}"}
    auth_admin = {"Authorization": f"Bearer {admin_token}"}

    app_res = client.post("/api/applications", json={
        "scheme_id": "NSP-NOTIF-03",
        "scheme_name": "National Scholarship Scheme",
        "category": "Education",
        "reference_no": "NSP-TEST-003"
    }, headers=auth_citizen)
    assert app_res.status_code == 201
    app_id = app_res.json()["id"]

    # Admin records benefit sanction
    update_res = client.patch(f"/api/applications/{app_id}", json={
        "action_type": "BENEFIT_SANCTION",
        "status": "Approved",
        "current_stage": "Benefit Sanctioned",
        "sanction_amount": 25000.0,
        "notes": "Sanction order issued for Direct Benefit Transfer"
    }, headers=auth_admin)
    assert update_res.status_code == 200

    # Citizen inspects notifications
    notif_res = client.get("/api/notifications", headers=auth_citizen)
    assert notif_res.status_code == 200
    notifs = notif_res.json()

    sanction_notif = next((n for n in notifs if n.get("application_id") == app_id and n.get("type") == "BENEFIT_SANCTION"), None)
    assert sanction_notif is not None
    assert "Benefit Sanctioned" in sanction_notif["title"]
    assert "25,000.00" in sanction_notif["message"]


def test_unread_count_and_mark_read_flow(client, citizen_a_token):
    """Confirm unread count tracking, marking individual items as read, and bulk mark-all-read."""
    auth_citizen = {"Authorization": f"Bearer {citizen_a_token}"}

    # Dispatch two test notifications for citizen A
    n1 = notification_service.dispatch_notification(
        user_id="USR-CITIZEN-NOTIF-A",
        title="Test Notification 1",
        message="Message 1"
    )
    n2 = notification_service.dispatch_notification(
        user_id="USR-CITIZEN-NOTIF-A",
        title="Test Notification 2",
        message="Message 2"
    )

    # Check unread count
    count_res = client.get("/api/notifications/unread-count", headers=auth_citizen)
    assert count_res.status_code == 200
    initial_unread = count_res.json()["unread_count"]
    assert initial_unread >= 2

    # Mark n1 as read
    patch_res = client.patch(f"/api/notifications/{n1['id']}/read", headers=auth_citizen)
    assert patch_res.status_code == 200
    assert patch_res.json()["success"] is True

    # Count should decrement by 1
    count_res_after = client.get("/api/notifications/unread-count", headers=auth_citizen)
    assert count_res_after.json()["unread_count"] == initial_unread - 1

    # Mark all remaining as read
    bulk_res = client.post("/api/notifications/mark-all-read", headers=auth_citizen)
    assert bulk_res.status_code == 200
    assert bulk_res.json()["success"] is True

    # Final unread count should be 0
    final_count = client.get("/api/notifications/unread-count", headers=auth_citizen)
    assert final_count.json()["unread_count"] == 0

    # Unread-only query returns empty
    unread_only_res = client.get("/api/notifications?unread_only=true", headers=auth_citizen)
    assert unread_only_res.status_code == 200
    assert len(unread_only_res.json()) == 0


def test_cross_user_isolation_and_unauthorized_access(client, citizen_a_token, citizen_b_token):
    """Confirm Citizen B cannot view, mark read, or delete Citizen A's notifications."""
    auth_a = {"Authorization": f"Bearer {citizen_a_token}"}
    auth_b = {"Authorization": f"Bearer {citizen_b_token}"}

    # Create notification strictly for Citizen A
    notif_a = notification_service.dispatch_notification(
        user_id="USR-CITIZEN-NOTIF-A",
        title="Confidential Alert for Citizen A",
        message="Confidential grievance reference details"
    )
    notif_id = notif_a["id"]

    # Citizen B lists their notifications: must NOT see Citizen A's notification
    res_b = client.get("/api/notifications", headers=auth_b)
    assert res_b.status_code == 200
    b_notif_ids = [n["id"] for n in res_b.json()]
    assert notif_id not in b_notif_ids

    # Citizen B attempts to mark Citizen A's notification as read -> 404 (Not Found / User-Scoped)
    tamper_patch = client.patch(f"/api/notifications/{notif_id}/read", headers=auth_b)
    assert tamper_patch.status_code == 404

    # Citizen B attempts to delete Citizen A's notification -> 404
    tamper_delete = client.delete(f"/api/notifications/{notif_id}", headers=auth_b)
    assert tamper_delete.status_code == 404

    # Citizen A can successfully mark their own notification as read
    valid_patch = client.patch(f"/api/notifications/{notif_id}/read", headers=auth_a)
    assert valid_patch.status_code == 200

    # Citizen A can successfully delete their own notification
    valid_delete = client.delete(f"/api/notifications/{notif_id}", headers=auth_a)
    assert valid_delete.status_code == 200


def test_notification_error_and_edge_cases(client, citizen_a_token):
    """Confirm 404 responses for non-existent notification IDs."""
    auth_a = {"Authorization": f"Bearer {citizen_a_token}"}

    # Mark non-existent notification as read -> 404
    res = client.patch("/api/notifications/NON_EXISTENT_NOTIF_12345/read", headers=auth_a)
    assert res.status_code == 404

    # Delete non-existent notification -> 404
    res = client.delete("/api/notifications/NON_EXISTENT_NOTIF_12345", headers=auth_a)
    assert res.status_code == 404


def test_notification_dispatch_failure_does_not_fail_application_update(client, citizen_a_token, admin_token, monkeypatch):
    """Confirm that an unexpected failure in notification dispatch does not fail the application status update."""
    auth_citizen = {"Authorization": f"Bearer {citizen_a_token}"}
    auth_admin = {"Authorization": f"Bearer {admin_token}"}

    # Submit application
    app_res = client.post("/api/applications", json={
        "scheme_id": "PMAY-FAILSAFE-01",
        "scheme_name": "PMAY Failsafe Scheme",
        "category": "Housing",
        "reference_no": "PMAY-SAFE-999"
    }, headers=auth_citizen)
    assert app_res.status_code == 201
    app_id = app_res.json()["id"]

    # Mock dispatch_notification to raise an exception
    def broken_dispatch(*args, **kwargs):
        raise RuntimeError("Simulated transient network failure during notification dispatch")

    monkeypatch.setattr(notification_service, "dispatch_notification", broken_dispatch)

    # Admin updates application status to "Under Review"
    update_res = client.patch(f"/api/applications/{app_id}", json={
        "status": "Under Review",
        "notes": "Verified despite notification outage"
    }, headers=auth_admin)

    # Must succeed (HTTP 200) without crashing or rolling back
    assert update_res.status_code == 200
    data = update_res.json()
    assert data["status"] == "Under Review"

    # Confirm updated status persists on GET
    get_res = client.get(f"/api/applications/{app_id}", headers=auth_citizen)
    assert get_res.status_code == 200
    assert get_res.json()["status"] == "Under Review"

