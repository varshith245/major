import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Response, Header, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from ..services.mongodb_service import mongodb_service
from ..services.document_verifier import document_verifier
from ..services.auth_service import auth_service
from ..services.audit_service import audit_service
from ..security.dependencies import get_current_user, get_optional_current_user
from ..models.schemas import DocumentUploadResponse, DocumentVerificationResponse
from ..database.connection import get_db
from ..database.models import UploadedDocumentDB

router = APIRouter(prefix="/api/documents", tags=["Citizen Document Locker & Vault"])

def validate_document_bytes(content: bytes, filename: str, content_type: str):
    """
    Strict backend verification of file size, file extension, and binary signatures (magic bytes).
    Prevents forged MIME types, empty files, oversized files, and malicious payload uploads.
    """
    file_size = len(content)
    if file_size == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if file_size > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File size ({round(file_size / (1024 * 1024), 2)} MB) exceeds the 10 MB limit."
        )

    allowed_mimes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    if content_type not in allowed_mimes:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{content_type}'. Allowed types: JPG, PNG, WEBP, PDF."
        )

    ext = os.path.splitext(filename.lower())[1]
    allowed_exts = [".jpg", ".jpeg", ".png", ".webp", ".pdf"]
    if ext and ext not in allowed_exts:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file extension '{ext}'. Allowed extensions: .jpg, .jpeg, .png, .webp, .pdf."
        )

    # Magic byte binary inspection
    if content_type == "application/pdf":
        if not content.startswith(b"%PDF"):
            raise HTTPException(status_code=400, detail="Corrupted or invalid PDF file header signature.")
    elif content_type == "image/png":
        if not content.startswith(b"\x89PNG\r\n\x1a\n"):
            raise HTTPException(status_code=400, detail="Corrupted or invalid PNG image header signature.")
    elif content_type == "image/jpeg":
        if not (content.startswith(b"\xff\xd8\xff") or content.startswith(b"\xff\xd8")):
            raise HTTPException(status_code=400, detail="Corrupted or invalid JPEG image header signature.")
    elif content_type == "image/webp":
        if not (len(content) >= 12 and content[:4] == b"RIFF" and content[8:12] == b"WEBP"):
            raise HTTPException(status_code=400, detail="Corrupted or invalid WEBP image header signature.")

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form("Aadhaar Card"),
    scheme_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Uploads citizen verification documents to MongoDB Atlas GridFS, strictly scoped
    to the authenticated citizen's user_id. Anonymous uploads are strictly denied.
    """
    try:
        content = await file.read()
        filename = file.filename or "uploaded_doc"
        content_type = file.content_type or "application/octet-stream"

        # Strict backend size, type, and binary signature enforcement
        validate_document_bytes(content=content, filename=filename, content_type=content_type)
        file_size = len(content)

        user_id = current_user.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Valid user ID is required.")

        # Upload to MongoDB Atlas GridFS scoped to user_id
        res = mongodb_service.upload_document(
            file_content=content,
            filename=filename,
            document_type=document_type,
            scheme_id=scheme_id,
            content_type=content_type,
            user_id=user_id
        )

        if not res.get("success"):
            raise HTTPException(
                status_code=500,
                detail=f"MongoDB Atlas upload failed: {res.get('error')}"
            )

        file_id = res.get("file_id")
        file_url = res.get("url")

        # Also store record in SQL DB if available for redundancy with user_id
        try:
            db_doc = UploadedDocumentDB(
                user_id=user_id,
                scheme_id=scheme_id,
                document_type=document_type,
                original_filename=filename,
                cloudinary_url=file_url,
                cloudinary_public_id=file_id,
                file_size_bytes=file_size,
                verification_status="Verified (MongoDB Atlas)"
            )
            db.add(db_doc)
            db.commit()
            db.refresh(db_doc)
        except Exception as db_err:
            print(f"[Warning] SQL DB sync skipped: {db_err}")
            db.rollback()

        # Record in audit trail for real-time admin monitoring
        audit_service.log_action(
            admin_email=current_user.get("email") or f"{user_id}@egovseva.gov.in",
            admin_name=current_user.get("full_name", "Varshith D"),
            action="DOCUMENT_UPLOADED",
            resource=f"{document_type} ({filename})",
            resource_id=file_id,
            details={
                "document_type": document_type,
                "filename": filename,
                "file_size": file_size,
                "scheme_id": scheme_id,
                "user_id": user_id
            },
            status="Verified"
        )

        return DocumentUploadResponse(
            success=True,
            message="Document uploaded successfully and securely stored in your Citizen Document Vault.",
            scheme_id=scheme_id,
            document_type=document_type,
            file_id=file_id,
            file_url=file_url,
            mongodb_id=file_id,
            user_id=user_id,
            storage_provider="MongoDB Atlas",
            cloudinary_url=file_url,
            cloudinary_public_id=file_id,
            file_size_bytes=file_size,
            verification_status="Verified (MongoDB Atlas)"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload processing failed: {str(e)}")

@router.post("/{file_id}/preview-token")
async def generate_preview_token(
    file_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Generates a short-lived (60s), single-file preview ticket strictly for direct
    browser previews. Validates document ownership prior to issuing the token.
    """
    meta = mongodb_service.get_document_metadata(file_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Document not found.")

    doc_user_id = meta.get("user_id")
    if current_user.get("role") != "admin":
        if not doc_user_id or doc_user_id != current_user.get("user_id"):
            raise HTTPException(status_code=404, detail="Document not found.")

    token = auth_service.create_document_preview_token(
        user_id=current_user["user_id"],
        file_id=file_id,
        expires_seconds=60
    )

    return {
        "success": True,
        "preview_token": token,
        "file_id": file_id,
        "expires_in_seconds": 60,
        "preview_url": f"/api/documents/file/{file_id}?preview_token={token}"
    }

@router.get("/file/{file_id}")
async def get_document_file(
    file_id: str,
    authorization: Optional[str] = Header(None),
    preview_token: Optional[str] = Query(None)
):
    """
    Retrieves and streams the document binary directly from MongoDB Atlas GridFS.
    Security Architecture:
    1. Primary method: 'Authorization: Bearer <token>' header.
    2. Direct browser view fallback: Short-lived (60s), single-file 'preview_token' query param.
    3. Long-lived access tokens in URL queries are strictly rejected.
    4. Enforces strict backend ownership: Citizens can preview/download ONLY their own documents.
    5. Citizens cannot access unowned or legacy documents (returns 404).
    """
    current_user = None

    # Method 1: Standard Bearer Token Header (Recommended)
    if authorization:
        current_user = await get_optional_current_user(authorization=authorization)

    # Method 2: Short-lived Single-File Preview Token
    elif preview_token:
        payload = auth_service.verify_document_preview_token(preview_token, file_id=file_id)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid, expired, or mismatched document preview token."
            )
        user_id = payload.get("user_id") or payload.get("sub")
        user = auth_service.get_user_by_id(user_id)
        if user and user.get("is_active", True):
            user_copy = user.copy()
            user_copy.pop("hashed_password", None)
            user_copy.pop("_id", None)
            current_user = user_copy

    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to preview or download document.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    meta = mongodb_service.get_document_metadata(file_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Document not found.")

    doc_user_id = meta.get("user_id")
    # Strict rule: Non-admin citizens cannot download other citizens' documents or unowned/legacy files
    if current_user.get("role") != "admin":
        if not doc_user_id or doc_user_id != current_user.get("user_id"):
            raise HTTPException(status_code=404, detail="Document not found.")

    res = mongodb_service.get_document(file_id)
    if not res:
        raise HTTPException(status_code=404, detail="Document not found in storage.")

    content, filename, content_type = res
    return Response(
        content=content,
        media_type=content_type,
        headers={"Content-Disposition": f"inline; filename={filename}"}
    )

@router.get("/list")
async def list_documents(
    limit: int = 50,
    target_user_id: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Lists documents stored in MongoDB Atlas.
    Citizens can list ONLY their own documents.
    Admins may inspect documents across the portal or filter by target_user_id.
    """
    if current_user.get("role") == "admin":
        return mongodb_service.list_documents(user_id=target_user_id, limit=limit)

    # Scoped strictly to the authenticated citizen
    return mongodb_service.list_documents(user_id=current_user.get("user_id"), limit=limit)

@router.delete("/{file_id}")
async def delete_document(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Deletes a citizen document from GridFS and metadata collections.
    Enforces ownership: only the owner or an admin can delete a document.
    Citizens cannot delete legacy unowned documents.
    """
    meta = mongodb_service.get_document_metadata(file_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Document not found.")

    doc_user_id = meta.get("user_id")
    if current_user.get("role") != "admin":
        if not doc_user_id or doc_user_id != current_user.get("user_id"):
            raise HTTPException(status_code=404, detail="Document not found.")

    # Delete from MongoDB Atlas
    mongodb_service.delete_document(file_id)

    # Delete from SQL redundancy table if present
    try:
        db.query(UploadedDocumentDB).filter(UploadedDocumentDB.cloudinary_public_id == file_id).delete()
        db.commit()
    except Exception as db_err:
        print(f"[Warning] SQL DB delete sync skipped: {db_err}")
        db.rollback()

    return {"success": True, "message": "Document deleted successfully."}

@router.post("/verify", response_model=DocumentVerificationResponse)
async def verify_document(
    file: UploadFile = File(...),
    document_type: str = Form("Aadhaar Card"),
    scheme_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user)
):
    """
    Validates document file format, resolution, legibility, and government portal readiness.
    Preserves optional unauthenticated check for standalone verification tests.
    """
    try:
        content = await file.read()
        filename = file.filename or "uploaded_document"
        content_type = file.content_type or "application/octet-stream"

        validate_document_bytes(content=content, filename=filename, content_type=content_type)

        return document_verifier.verify_document(
            file_bytes=content,
            filename=filename,
            content_type=content_type,
            document_type=document_type,
            scheme_id=scheme_id,
            db_session=db
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")
