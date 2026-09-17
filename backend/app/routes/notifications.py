from fastapi import APIRouter, HTTPException, Depends, Query, status
from typing import List, Dict, Any
from ..security.dependencies import get_current_user
from ..services.notification_service import notification_service
from ..models.schemas import Notification, NotificationUnreadCountResponse, NotificationMarkReadResponse

router = APIRouter(prefix="/api/notifications", tags=["Citizen Notification Engine"])

@router.get("", response_model=List[Notification])
async def list_my_notifications(
    unread_only: bool = Query(False),
    limit: int = Query(50, ge=1, le=100),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Lists notifications scoped strictly to the authenticated citizen.
    Citizens cannot view another citizen's notifications.
    """
    user_id = current_user.get("user_id")
    docs = notification_service.list_user_notifications(
        user_id=user_id,
        limit=limit,
        unread_only=unread_only
    )
    return [Notification(**d) for d in docs]

@router.get("/unread-count", response_model=NotificationUnreadCountResponse)
async def get_my_unread_count(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Returns unread notification badge count for the authenticated citizen.
    """
    user_id = current_user.get("user_id")
    count = notification_service.get_unread_count(user_id=user_id)
    return NotificationUnreadCountResponse(unread_count=count)

@router.patch("/{notification_id}/read", response_model=NotificationMarkReadResponse)
async def mark_notification_read(
    notification_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Marks a specific notification as read.
    Validates that the notification belongs to the authenticated citizen.
    """
    user_id = current_user.get("user_id")
    success = notification_service.mark_notification_as_read(
        user_id=user_id,
        notification_id=notification_id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found."
        )

    return NotificationMarkReadResponse(
        success=True,
        message="Notification marked as read.",
        updated_count=1
    )

@router.post("/mark-all-read", response_model=NotificationMarkReadResponse)
async def mark_all_notifications_read(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Marks all notifications belonging to the authenticated citizen as read.
    """
    user_id = current_user.get("user_id")
    count = notification_service.mark_all_as_read(user_id=user_id)
    return NotificationMarkReadResponse(
        success=True,
        message="All notifications marked as read.",
        updated_count=count
    )

@router.delete("/{notification_id}", response_model=NotificationMarkReadResponse)
async def delete_notification(
    notification_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Deletes a notification, enforcing strict user ownership.
    Citizens cannot delete another citizen's notification.
    """
    user_id = current_user.get("user_id")
    success = notification_service.delete_notification(
        user_id=user_id,
        notification_id=notification_id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found."
        )

    return NotificationMarkReadResponse(
        success=True,
        message="Notification deleted successfully.",
        updated_count=1
    )
