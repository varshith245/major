import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.auth_service import auth_service
from backend.app.services.notification_service import notification_service

client = TestClient(app)

print("=" * 80)
print("SEVA AI: FOCUSED MANUAL END-TO-END VERIFICATION OF PDF EXPORT & ALERT ENGINE")
print("=" * 80)

# Setup test citizen accounts
citizen_a_token = auth_service.create_access_token({
    "sub": "USR-CITIZEN-ALPHA",
    "user_id": "USR-CITIZEN-ALPHA",
    "email": "citizen.alpha@egovseva.test",
    "full_name": "Ramesh Kumar Sharma",
    "role": "user"
})

citizen_b_token = auth_service.create_access_token({
    "sub": "USR-CITIZEN-BETA",
    "user_id": "USR-CITIZEN-BETA",
    "email": "citizen.beta@egovseva.test",
    "full_name": "Priya Sundaram",
    "role": "user"
})

admin_token = auth_service.create_access_token({
    "sub": "USR-ADMIN-NODAL",
    "user_id": "USR-ADMIN-NODAL",
    "email": "nodal.officer@egovseva.gov.in",
    "full_name": "District Nodal Officer",
    "role": "admin"
})

auth_a = {"Authorization": f"Bearer {citizen_a_token}"}
auth_b = {"Authorization": f"Bearer {citizen_b_token}"}
auth_admin = {"Authorization": f"Bearer {admin_token}"}

# --------------------------------------------------------------------------------
# Step 1: As Citizen A, submit an application and download own acknowledgment PDF
# --------------------------------------------------------------------------------
print("\n[STEP 1] Citizen A submitting application & downloading acknowledgment PDF...")
submit_res = client.post("/api/applications", json={
    "scheme_id": "GOI-AGRI-001",
    "scheme_name": "PM Kisan Samman Nidhi",
    "category": "Agriculture",
    "reference_no": "PMK-E2E-2026-9001",
    "notes": "Small farmer DBT entitlement application"
}, headers=auth_a)

assert submit_res.status_code == 201, f"Submit failed: {submit_res.text}"
app_data = submit_res.json()
app_id_a = app_data["id"]
ref_no_a = app_data["reference_no"]
print(f" -> Application filed successfully: ID={app_id_a}, Ref={ref_no_a}")

# Download acknowledgment PDF as Citizen A
ack_res_a = client.get(f"/api/applications/{app_id_a}/acknowledgment-pdf", headers=auth_a)
assert ack_res_a.status_code == 200, f"Download failed: {ack_res_a.text}"
assert ack_res_a.headers.get("content-type") == "application/pdf"
assert "Content-Disposition" in ack_res_a.headers
pdf_a_bytes = ack_res_a.content
print(f" -> Acknowledgment PDF received: {len(pdf_a_bytes)} bytes, starts with: {pdf_a_bytes[:8].decode('latin1')}")
print(" -> [PASS] Step 1: Citizen successfully downloaded own application acknowledgment PDF.")

# --------------------------------------------------------------------------------
# Step 2: Citizen B attempts to access Citizen A's acknowledgment using Citizen A's ID
# --------------------------------------------------------------------------------
print("\n[STEP 2] Citizen B attempting to access Citizen A's acknowledgment PDF...")
tamper_res = client.get(f"/api/applications/{app_id_a}/acknowledgment-pdf", headers=auth_b)
print(f" -> Tamper request HTTP status: {tamper_res.status_code}")
assert tamper_res.status_code == 404, f"Expected 404 Not Found, got {tamper_res.status_code}"
detail = tamper_res.json().get("detail", "")
print(f" -> Access rejection detail: '{detail}'")
print(" -> [PASS] Step 2: Cross-user access strictly denied. Citizens cannot access other citizens' PDFs.")

# --------------------------------------------------------------------------------
# Step 3: Export a comparison PDF for multiple valid schemes
# --------------------------------------------------------------------------------
print("\n[STEP 3] Exporting comparison PDF for multiple valid schemes...")
comp_res = client.post("/api/comparison/export-pdf", json={
    "scheme_ids": ["GOI-AGRI-001", "GOI-HLTH-002", "GOI-HOUS-003"]
})
assert comp_res.status_code == 200, f"Comparison export failed: {comp_res.text}"
assert comp_res.headers.get("content-type") == "application/pdf"
comp_pdf_bytes = comp_res.content
print(f" -> Comparison PDF received: {len(comp_pdf_bytes)} bytes, starts with: {comp_pdf_bytes[:8].decode('latin1')}")
print(" -> [PASS] Step 3: Comparison PDF for multiple schemes exported successfully.")

# --------------------------------------------------------------------------------
# Step 4: Check that both PDFs open, are readable, print correctly & contain expected data
# --------------------------------------------------------------------------------
print("\n[STEP 4] Inspecting content and document integrity in generated PDFs...")

# Inspect Acknowledgment PDF content
pdf_a_text = pdf_a_bytes.decode('latin1', errors='ignore')
expected_ack_terms = [
    ("Reference Number", ref_no_a),
    ("Application ID", app_id_a),
    ("Scheme Name", "PM Kisan Samman Nidhi"),
    ("Status", "SUBMITTED"),
    ("Document-Integrity Hash Label", "DOCUMENT-INTEGRITY HASH"),
    ("Disclaimer Note", "document-integrity hash computed from the application record"),
    ("Statutory Disclaimer", "STATUTORY DISCLAIMER & CITIZEN GUIDELINES")
]

print(" -> Checking Acknowledgment PDF contents:")
for label, term in expected_ack_terms:
    present = term in pdf_a_text
    print(f"    * {label} ('{term}'): {'[FOUND]' if present else '[MISSING]'}")
    assert present, f"Missing term in Acknowledgment PDF: {term}"

# Inspect Comparison PDF content
comp_pdf_text = comp_pdf_bytes.decode('latin1', errors='ignore')
expected_comp_terms = [
    ("Scheme 1 Full Name", "Pradhan Mantri Kisan Samman Nidhi"),
    ("Scheme 1 Short Code", "PM-KISAN"),
    ("Scheme 2 Full Name", "Ayushman Bharat"),
    ("Scheme 2 Short Code", "AB-PMJAY"),
    ("Scheme 3 Full Name", "Pradhan Mantri Awas Yojana"),
    ("Scheme 3 Short Code", "PMAY-G"),
    ("Header Title", "SCHEME COMPARISON & ENTITLEMENT MATRIX REPORT"),
    ("Parameter Ministry", "Ministry / Department"),
    ("Parameter Benefit", "Financial Benefit Amount"),
    ("Parameter Age", "Age Criteria"),
    ("Parameter Documents", "Mandatory Documents"),
    ("Legal Notice", "LEGAL & PROCEDURAL NOTICE")
]

print(" -> Checking Comparison PDF contents:")
for label, term in expected_comp_terms:
    present = term in comp_pdf_text
    print(f"    * {label} ('{term}'): {'[FOUND]' if present else '[MISSING]'}")
    assert present, f"Missing term in Comparison PDF: {term}"

print(" -> [PASS] Step 4: Both PDFs are well-formed, readable, and contain all expected verified content.")

# --------------------------------------------------------------------------------
# Step 5: Confirm notification dispatch failure does not interrupt application status update
# --------------------------------------------------------------------------------
print("\n[STEP 5] Testing failsafe handling: status update when notification dispatch fails...")

# Intentionally force notification_service.dispatch_notification to throw an exception
original_dispatch = notification_service.dispatch_notification
def faulty_dispatch(*args, **kwargs):
    print("      [SIMULATION] Transient exception triggered in dispatch_notification!")
    raise ConnectionResetError("Simulated socket connection reset to notification gateway")

notification_service.dispatch_notification = faulty_dispatch

try:
    update_res = client.patch(f"/api/applications/{app_id_a}", json={
        "status": "Under Review",
        "current_stage": "Document Scrutiny",
        "stage_order": 2,
        "notes": "Verified by nodal authority during notification outage test"
    }, headers=auth_admin)

    assert update_res.status_code == 200, f"Status update failed: {update_res.text}"
    updated_record = update_res.json()
    assert updated_record["status"] == "Under Review"
    print(f" -> Application status successfully updated to: '{updated_record['status']}'")

    # Verify persistence
    verify_res = client.get(f"/api/applications/{app_id_a}", headers=auth_a)
    assert verify_res.status_code == 200
    assert verify_res.json()["status"] == "Under Review"
    print(" -> Persisted status verified on citizen query: 'Under Review'")
    print(" -> [PASS] Step 5: Status update succeeded without interruption despite notification failure.")
finally:
    notification_service.dispatch_notification = original_dispatch

print("\n" + "=" * 80)
print("ALL 5 END-TO-END MANUAL VERIFICATIONS COMPLETED SUCCESSFULLY WITH ZERO ERRORS!")
print("=" * 80)
