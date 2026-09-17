# backend/app/routes/dashboard.py

"""Citizen Dashboard API routes.
Provides endpoints to fetch personalized data for the citizen dashboard.
All routes are protected by JWT authentication and require the USER role.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from ..models import schemas
from ..models.schemas import UserRole
from ..services import dashboard_service
from typing import Optional

router = APIRouter(prefix="/dashboard", tags=["Citizen Dashboard"])

# Dependency to enforce USER role
from fastapi import Header
from ..services.auth_service import auth_service

async def user_role_dependency(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header")
    parts = authorization.strip().split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Authorization header")
    token = parts[1]
    payload = auth_service.decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    role = payload.get("role", "user")
    if role != UserRole.USER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
    return {"user_id": payload.get("user_id") or payload.get("sub"), "role": role}

@router.get("/saved-schemes", response_model=List[schemas.Scheme])
async def get_saved_schemes(user: dict = Depends(user_role_dependency)):
    return await dashboard_service.get_saved_schemes(user["user_id"])

@router.get("/recent-views", response_model=List[schemas.Scheme])
async def get_recent_views(user: dict = Depends(user_role_dependency)):
    return await dashboard_service.get_recent_views(user["user_id"])

@router.get("/eligibility-history", response_model=List[schemas.EligibilityResult])
async def get_eligibility_history(user: dict = Depends(user_role_dependency)):
    return await dashboard_service.get_eligibility_history(user["user_id"])

@router.get("/checklist-progress", response_model=List[schemas.ChecklistResponse])
async def get_checklist_progress(user: dict = Depends(user_role_dependency)):
    return await dashboard_service.get_checklist_progress(user["user_id"])

@router.get("/journey", response_model=List[schemas.ApplicationJourney])
async def get_application_journey(user: dict = Depends(user_role_dependency)):
    return await dashboard_service.get_application_journey(user["user_id"])

@router.get("/upcoming-deadlines", response_model=List[schemas.Scheme])
async def get_upcoming_deadlines(user: dict = Depends(user_role_dependency)):
    return await dashboard_service.get_upcoming_deadlines(user["user_id"])

@router.get("/notifications", response_model=List[schemas.Notification])
async def get_notifications(user: dict = Depends(user_role_dependency)):
    return await dashboard_service.get_notifications(user["user_id"])

@router.get("/recent-chat", response_model=List[schemas.ChatResponse])
async def get_recent_chat(user: dict = Depends(user_role_dependency)):
    return await dashboard_service.get_recent_chat(user["user_id"])

@router.patch("/language-preference")
async def set_language_preference(language: str, user: dict = Depends(user_role_dependency)):
    await dashboard_service.update_language_preference(user["user_id"], language)
    return {"success": True, "message": "Language preference updated"}
