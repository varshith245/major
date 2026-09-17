import pytest

ENDPOINTS = [
    "/dashboard/saved-schemes",
    "/dashboard/recent-views",
    "/dashboard/eligibility-history",
    "/dashboard/checklist-progress",
    "/dashboard/journey",
    "/dashboard/upcoming-deadlines",
    "/dashboard/notifications",
    "/dashboard/recent-chat",
]

def test_unauthenticated_access(client):
    for ep in ENDPOINTS:
        resp = client.get(ep)
        assert resp.status_code == 401, f"{ep} should return 401 when unauthenticated"

def test_user_a_requests(client, auth_header):
    headers = auth_header("user_a")
    # Saved schemes should contain one entry
    resp = client.get("/dashboard/saved-schemes", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert any(item.get("scheme_id") == "SCHEME1" for item in data)

    # Recent views – same data
    resp = client.get("/dashboard/recent-views", headers=headers)
    assert resp.status_code == 200
    assert any(item.get("scheme_id") == "SCHEME1" for item in resp.json())

    # Eligibility history
    resp = client.get("/dashboard/eligibility-history", headers=headers)
    assert resp.status_code == 200
    assert any(item.get("scheme_id") == "SCHEME1" for item in resp.json())

    # Checklist progress
    resp = client.get("/dashboard/checklist-progress", headers=headers)
    assert resp.status_code == 200
    assert any(item.get("scheme_id") == "SCHEME1" for item in resp.json())

    # Application journey
    resp = client.get("/dashboard/journey", headers=headers)
    assert resp.status_code == 200
    assert any(item.get("scheme_id") == "SCHEME1" for item in resp.json())

    # Upcoming deadlines – should include the test scheme (future deadline)
    resp = client.get("/dashboard/upcoming-deadlines", headers=headers)
    assert resp.status_code == 200
    assert any(item.get("scheme_id") == "SCHEME1" for item in resp.json())

    # Notifications
    resp = client.get("/dashboard/notifications", headers=headers)
    assert resp.status_code == 200
    assert any(item.get("message") == "Your application is pending" for item in resp.json())

    # Recent chat
    resp = client.get("/dashboard/recent-chat", headers=headers)
    assert resp.status_code == 200
    assert any(item.get("query") == "How to apply?" for item in resp.json())

    # Language preference update (PATCH)
    resp = client.patch("/dashboard/language-preference", params={"language": "en"}, headers=headers)
    assert resp.status_code == 200
    assert resp.json().get("success") is True

def test_user_isolation(client, auth_header):
    # Create token for a different user who has no data
    headers = auth_header("user_other")
    for ep in ENDPOINTS:
        resp = client.get(ep, headers=headers)
        assert resp.status_code == 200
        # All endpoints should return an empty list for a user with no records
        assert resp.json() == [], f"{ep} should return empty list for user with no data"
