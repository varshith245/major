from fastapi import Depends, HTTPException, status, Header
from typing import Optional, List, Dict, Any
from ..services.auth_service import auth_service
from ..models.schemas import UserRole  # Imported for RBAC

async def get_optional_current_user(
    authorization: Optional[str] = Header(None)
) -> Optional[Dict[str, Any]]:
    """
    Extracts and validates JWT token if present in 'Authorization: Bearer <token>' header.
    Returns the user dict if authenticated, or None if unauthenticated guest.
    This guarantees 100% non-breaking public access.
    """
    if not authorization:
        return None

    try:
        parts = authorization.strip().split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return None

        token = parts[1]
        payload = auth_service.decode_access_token(token)
        if not payload or "sub" not in payload:
            return None

        user_id = payload.get("user_id") or payload.get("sub")
        user = auth_service.get_user_by_id(user_id)
        if not user or not user.get("is_active", True):
            return None

        # Strip sensitive hash before returning
        user_copy = user.copy()
        user_copy.pop("hashed_password", None)
        user_copy.pop("_id", None)
        return user_copy
    except Exception:
        return None

async def get_current_user(
    authorization: Optional[str] = Header(None)
) -> Dict[str, Any]:
    """
    Mandatory authentication dependency. Raises HTTP 401 Unauthorized if invalid or missing token.
    """
    user = await get_optional_current_user(authorization=authorization)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in with a valid access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def require_role(allowed_roles: List[str]):
    """
    Role-Based Access Control (RBAC) dependency generator.
    Example: Depends(require_role(["admin"]))
    """
    async def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = current_user.get("role", "user")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Requires one of roles {allowed_roles}. Current role: '{user_role}'."
            )
        return current_user

    return role_checker
