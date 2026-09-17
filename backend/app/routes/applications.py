import time
import random
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header, Query, Response

from ..models import schemas
from ..models.schemas import (
    ApplicationCreateRequest,
    ApplicationResponse,
    ApplicationStatusUpdateRequest,
    UserRole
)
from ..services.auth_service import auth_service
from ..services.audit_service import audit_service
from ..services.notification_service import notification_service
from ..services.pdf_export_service import pdf_export_service
from ..database.mongodb import mongodb_manager

router = APIRouter(prefix="/api/applications", tags=["Citizen Applications"])

async def user_role_dependency(authorization: Optional[str] = Header(None)) -> dict:
    """
    Validates JWT token and extracts authenticated user ID and role.
    Supports both citizen users and system administrators.
    """
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header")
    parts = authorization.strip().split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Authorization header")
    token = parts[1]
    payload = auth_service.decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user_id = payload.get("user_id") or payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload: missing user identification")
    role = payload.get("role", UserRole.USER)
    return {
        "user_id": user_id,
        "role": role,
        "email": payload.get("email", ""),
        "full_name": payload.get("full_name", "")
    }

def _get_collection(name: str):
    db = mongodb_manager.get_db()
    if db is None:
        raise RuntimeError("MongoDB is not connected")
    return db[name]

@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def submit_application(
    req: ApplicationCreateRequest,
    user: dict = Depends(user_role_dependency)
):
    col = _get_collection("applications")
    journey_col = _get_collection("application_journey")
    
    # Security Rule 1: Citizens cannot self-assign official approval, review, or rejection decisions
    if user["role"] != UserRole.ADMIN:
        if req.status and req.status.strip().title() not in ["Submitted"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Citizens cannot self-assign official status decisions (such as Approved, Rejected, or Under Review)."
            )
        status_val = "Submitted"
        stage_val = "Application Submitted"
        stage_order_val = 1
    else:
        status_val = req.status or "Submitted"
        stage_val = req.current_stage or "Application Submitted"
        stage_order_val = req.stage_order or 1

    app_id = f"APP-{int(time.time() * 1000)}"
    ref_no = req.reference_no or f"SEV-{datetime.now().year}-{random.randint(1000, 9999)}"
    now = datetime.now().strftime("%Y-%m-%d")
    
    doc = {
        "id": app_id,
        "user_id": user["user_id"],
        "scheme_id": req.scheme_id,
        "scheme_name": req.scheme_name,
        "category": req.category,
        "reference_no": ref_no,
        "status": status_val,
        "current_stage": stage_val,
        "stage_order": stage_order_val,
        "submission_date": now,
        "last_updated": now,
        "portal_url": req.portal_url or "https://www.india.gov.in",
        "notes": req.notes or f"Application tracked under reference #{ref_no}"
    }
    
    # Save application
    col.insert_one(doc.copy())
    
    # Synchronize journey tracker entry
    journey_doc = {
        "user_id": user["user_id"],
        "scheme_id": req.scheme_id,
        "scheme_name": req.scheme_name,
        "current_stage": stage_val,
        "stage_order": stage_order_val,
        "notes": req.notes or f"Application reference: {ref_no}"
    }
    journey_col.update_one(
        {"user_id": user["user_id"], "scheme_id": req.scheme_id},
        {"$set": journey_doc},
        upsert=True
    )
    
    doc.pop("_id", None)
    return ApplicationResponse(**doc)

@router.get("", response_model=List[ApplicationResponse])
async def list_user_applications(
    user_id: Optional[str] = Query(None),
    user: dict = Depends(user_role_dependency)
):
    col = _get_collection("applications")
    if user["role"] == UserRole.ADMIN:
        query = {"user_id": user_id} if user_id else {}
    else:
        # Citizens can ONLY read their own applications
        query = {"user_id": user["user_id"]}
        
    docs = list(col.find(query))
    
    results = []
    for d in docs:
        d.pop("_id", None)
        results.append(ApplicationResponse(**d))
    return results

@router.get("/{app_id}", response_model=ApplicationResponse)
async def get_application(
    app_id: str,
    user: dict = Depends(user_role_dependency)
):
    col = _get_collection("applications")
    if user["role"] == UserRole.ADMIN:
        query = {"id": app_id}
    else:
        query = {"id": app_id, "user_id": user["user_id"]}
        
    doc = col.find_one(query)
    if not doc:
        raise HTTPException(status_code=404, detail="Application not found")
    doc.pop("_id", None)
    return ApplicationResponse(**doc)

@router.get("/{app_id}/acknowledgment-pdf")
async def get_application_acknowledgment_pdf(
    app_id: str,
    user: dict = Depends(user_role_dependency)
):
    """
    Generates and returns an official, print-ready Citizen Application
    Acknowledgment Slip PDF. Scoped strictly to the owning citizen (or admin).
    """
    col = _get_collection("applications")
    users_col = _get_collection("users")
    
    if user["role"] == UserRole.ADMIN:
        existing = col.find_one({"id": app_id})
    else:
        existing = col.find_one({"id": app_id, "user_id": user["user_id"]})
        
    if not existing:
        raise HTTPException(status_code=404, detail="Application not found")
        
    user_doc = None
    try:
        user_doc = users_col.find_one({"user_id": existing.get("user_id")})
    except Exception:
        pass
        
    pdf_bytes = pdf_export_service.generate_application_acknowledgment_pdf(
        app_data=existing,
        user_data=user_doc
    )
    
    ref_no = existing.get("reference_no", app_id)
    safe_ref = ref_no.replace("/", "-").replace("\\", "-")
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="SEVA-Acknowledgment-{safe_ref}.pdf"'
        }
    )

@router.patch("/{app_id}", response_model=ApplicationResponse)
async def update_application_status(
    app_id: str,
    req: ApplicationStatusUpdateRequest,
    user: dict = Depends(user_role_dependency)
):
    col = _get_collection("applications")
    journey_col = _get_collection("application_journey")
    
    if user["role"] == UserRole.ADMIN:
        existing = col.find_one({"id": app_id})
    else:
        existing = col.find_one({"id": app_id, "user_id": user["user_id"]})
        
    if not existing:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Security Rule 2: Ordinary citizens cannot change official status decisions or workflow stages
    if user["role"] != UserRole.ADMIN:
        if req.status is not None and req.status.strip() != existing.get("status"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Citizens cannot modify official application status decisions. Only authorized administrators can update status."
            )
        if req.current_stage is not None and req.current_stage.strip() != existing.get("current_stage"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Citizens cannot modify official application workflow stages."
            )
        if req.stage_order is not None and req.stage_order != existing.get("stage_order"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Citizens cannot modify official stage ordering."
            )
        
    now = datetime.now().strftime("%Y-%m-%d")
    updates = {"last_updated": now}
    if req.status is not None:
        updates["status"] = req.status
    if req.current_stage is not None:
        updates["current_stage"] = req.current_stage
    if req.stage_order is not None:
        updates["stage_order"] = req.stage_order
    if req.notes is not None:
        updates["notes"] = req.notes
        
    if req.sanction_amount is not None:
        updates["sanction_amount"] = req.sanction_amount
    if req.missing_documents is not None:
        updates["missing_documents"] = req.missing_documents
        
    target_user_id = existing["user_id"]
    col.update_one({"id": app_id}, {"$set": updates})
    
    # Sync journey
    journey_updates = {}
    if req.current_stage is not None:
        journey_updates["current_stage"] = req.current_stage
    if req.stage_order is not None:
        journey_updates["stage_order"] = req.stage_order
    if req.notes is not None:
        journey_updates["notes"] = req.notes
    if journey_updates:
        journey_col.update_one(
            {"user_id": target_user_id, "scheme_id": existing["scheme_id"]},
            {"$set": journey_updates}
        )
        
    if user["role"] == UserRole.ADMIN:
        audit_service.log_action(
            admin_email=user.get("email", "admin@egovseva.gov.in"),
            admin_name=user.get("full_name", "Authorized Official"),
            action="UPDATE_APPLICATION_STATUS",
            resource="Application",
            resource_id=app_id,
            details={
                "old_status": existing.get("status"),
                "new_status": req.status or existing.get("status"),
                "target_user_id": target_user_id,
                "scheme_id": existing.get("scheme_id"),
                "notes": req.notes,
                "current_stage": req.current_stage,
                "action_type": req.action_type,
                "sanction_amount": req.sanction_amount,
                "missing_documents": req.missing_documents
            }
        )

        try:
            scheme_name = existing.get("scheme_name", "Government Scheme")
            ref_no = existing.get("reference_no", app_id)
            scheme_id = existing.get("scheme_id")

            if req.action_type == "DOCUMENT_REQUEST" or (req.missing_documents and len(req.missing_documents) > 0) or req.current_stage == "Documents Requested":
                doc_list_str = ", ".join(req.missing_documents) if req.missing_documents else (req.notes or "Required verification documents")
                notification_service.dispatch_notification(
                    user_id=target_user_id,
                    title=f"Action Required: Missing Documents for {scheme_name}",
                    message=f"The nodal officer has requested additional documents for {scheme_name} (Ref: {ref_no}): {doc_list_str}. Remarks: {req.notes or 'Please upload the requested documents promptly via your Document Vault.'}",
                    notification_type="DOCUMENT_REQUEST",
                    scheme_id=scheme_id,
                    scheme_name=scheme_name,
                    application_id=app_id,
                    reference_no=ref_no,
                    action_url="/dashboard?tab=vault",
                    metadata={"missing_documents": req.missing_documents, "notes": req.notes}
                )
            elif req.action_type == "BENEFIT_SANCTION" or (req.sanction_amount is not None and req.sanction_amount > 0) or req.current_stage == "Benefit Sanctioned":
                amt_str = f"₹{req.sanction_amount:,.2f}" if req.sanction_amount is not None else "Full Entitlement"
                notification_service.dispatch_notification(
                    user_id=target_user_id,
                    title=f"Benefit Sanctioned: {scheme_name}",
                    message=f"Direct Benefit Transfer / sanction of {amt_str} has been recorded for your application (Ref: {ref_no}). Remarks: {req.notes or 'Benefit sanctioned successfully.'}",
                    notification_type="BENEFIT_SANCTION",
                    scheme_id=scheme_id,
                    scheme_name=scheme_name,
                    application_id=app_id,
                    reference_no=ref_no,
                    action_url="/dashboard?tab=applications",
                    metadata={"sanction_amount": req.sanction_amount, "notes": req.notes}
                )
            elif req.status is not None or req.action_type == "STATUS_UPDATE":
                new_status = req.status or existing.get("status")
                notification_service.dispatch_notification(
                    user_id=target_user_id,
                    title=f"Application Status Updated: {new_status}",
                    message=f"Your application for {scheme_name} (Ref: {ref_no}) has moved to status: '{new_status}'. Remarks: {req.notes or 'No remarks provided.'}",
                    notification_type="STATUS_UPDATE",
                    scheme_id=scheme_id,
                    scheme_name=scheme_name,
                    application_id=app_id,
                    reference_no=ref_no,
                    action_url="/dashboard?tab=applications",
                    metadata={"status": new_status, "current_stage": req.current_stage, "notes": req.notes}
                )
        except Exception as dispatch_err:
            print(f"[Notification Alert Engine] Non-fatal dispatch notice for application {app_id}: {dispatch_err}")
        
    updated = col.find_one({"id": app_id})
    updated.pop("_id", None)
    return ApplicationResponse(**updated)

@router.delete("/{app_id}")
async def delete_application(
    app_id: str,
    user: dict = Depends(user_role_dependency)
):
    col = _get_collection("applications")
    journey_col = _get_collection("application_journey")
    
    if user["role"] == UserRole.ADMIN:
        existing = col.find_one({"id": app_id})
    else:
        existing = col.find_one({"id": app_id, "user_id": user["user_id"]})
        
    if not existing:
        raise HTTPException(status_code=404, detail="Application not found")
        
    target_user_id = existing["user_id"]
    col.delete_one({"id": app_id})
    journey_col.delete_one({"user_id": target_user_id, "scheme_id": existing["scheme_id"]})
    
    if user["role"] == UserRole.ADMIN:
        audit_service.log_action(
            admin_email=user.get("email", "admin@egovseva.gov.in"),
            admin_name=user.get("full_name", "Authorized Official"),
            action="DELETE_APPLICATION",
            resource="Application",
            resource_id=app_id,
            details={"scheme_id": existing.get("scheme_id"), "target_user_id": target_user_id}
        )
    
    return {"success": True, "message": "Application removed successfully"}
