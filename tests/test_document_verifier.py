import io
import pytest
from PIL import Image

def _get_client():
    from fastapi.testclient import TestClient
    from backend.app.main import app
    return TestClient(app)


def _create_test_image(width=800, height=600, format="JPEG") -> bytes:
    img = Image.new("RGB", (width, height), color=(240, 240, 240))
    buf = io.BytesIO()
    img.save(buf, format=format)
    return buf.getvalue()

def test_document_verify_invalid_file_type():
    file_bytes = b"echo 'bad script'"
    files = {"file": ("malicious.sh", file_bytes, "application/x-sh")}
    data = {"document_type": "Aadhaar Card"}

    res = _get_client().post("/api/documents/verify", files=files, data=data)
    assert res.status_code == 400
    assert "Invalid file type" in res.json()["detail"]

def test_document_verify_image_success():
    img_bytes = _create_test_image(900, 700, format="JPEG")
    files = {"file": ("aadhaar_front.jpg", img_bytes, "image/jpeg")}
    data = {"document_type": "Aadhaar Card", "scheme_id": "GOI-AGRI-001"}

    res = _get_client().post("/api/documents/verify", files=files, data=data)
    assert res.status_code == 200
    res_data = res.json()
    assert res_data["success"] is True
    assert res_data["verified"] is True
    assert res_data["readiness_score"] >= 70
    assert res_data["legibility_status"] == "High"
    assert len(res_data["checks"]) >= 4
    assert any(c["name"] == "Format & Binary Integrity" and c["passed"] for c in res_data["checks"])
    assert any(c["name"] == "Resolution & Visual Legibility" and c["passed"] for c in res_data["checks"])
    assert "UIDAI" in res_data["extracted_info"].get("Issuing Authority", "")

def test_document_verify_pdf_success():
    pdf_bytes = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\nGovernment of India Income Certificate Tehsildar Office\n%%EOF"
    files = {"file": ("income_certificate.pdf", pdf_bytes, "application/pdf")}
    data = {"document_type": "Income Certificate", "scheme_id": "GOI-AGRI-001"}

    res = _get_client().post("/api/documents/verify", files=files, data=data)
    assert res.status_code == 200
    res_data = res.json()
    assert res_data["success"] is True
    assert res_data["verified"] is True
    assert res_data["mime_type"] == "application/pdf"
    assert "Revenue" in res_data["extracted_info"].get("Issuing Authority", "")
    assert len(res_data["recommendations"]) > 0

def test_document_verifier_pattern_masking():
    from backend.app.services.document_verifier import document_verifier
    # Mock text payload with simulated 12-digit Aadhaar UID and PAN
    test_payload = b"%PDF-1.4\nUnique Identification Authority of India UIDAI Aadhaar: 5432 9876 1234 PAN: ABCDE1234F %%EOF"
    res = document_verifier.verify_document(
        file_bytes=test_payload,
        filename="masked_test.pdf",
        content_type="application/pdf",
        document_type="Aadhaar Card"
    )
    assert res.success is True
    assert "Aadhaar (Masked)" in res.extracted_info
    assert res.extracted_info["Aadhaar (Masked)"] == "XXXX-XXXX-1234"
    assert "PAN (Masked)" in res.extracted_info
    assert "ABXXX4F" == res.extracted_info["PAN (Masked)"]
