from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, Any
import datetime

from ..models.schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserResponse,
    UserProfileUpdateRequest,
    AdminUserListResponse,
    UpdateUserRoleRequest,
    UpdateUserStatusRequest,
    AdminUserActionResponse,
    SendOtpRequest,
    SendOtpResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
    OtpLoginRequest,
    UserRegisterWithOtpRequest
)
from ..services.auth_service import auth_service
from ..services.otp_service import otp_service
from ..security.dependencies import get_current_user, require_role
from ..database.mongodb import mongodb_manager


router = APIRouter(prefix="/api/auth", tags=["JWT Authentication & Citizen Vault"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(req: UserRegisterRequest):
    """
    Registers a new citizen user or admin account with BCrypt password hashing.
    Returns signed JWT access token and user profile.
    """
    # Verify email not already registered
    existing_user = auth_service.get_user_by_email(req.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An account with email '{req.email}' is already registered."
        )

    try:
        # All public self-registrations are strictly citizen accounts (role='user').
        # Only the designated portal administrator can manage roles.
        assigned_role = "user"
        user_doc = auth_service.create_user(
            email=req.email,
            password=req.password,
            full_name=req.full_name,
            role=assigned_role,
            phone_number=req.phone_number
        )

        # Generate JWT token
        token_payload = {
            "sub": user_doc["user_id"],
            "user_id": user_doc["user_id"],
            "email": user_doc["email"],
            "role": user_doc["role"],
            "full_name": user_doc["full_name"]
        }
        access_token = auth_service.create_access_token(token_payload)

        user_resp = UserResponse(
            user_id=user_doc["user_id"],
            email=user_doc["email"],
            full_name=user_doc["full_name"],
            role=user_doc["role"],
            phone_number=user_doc.get("phone_number"),
            is_active=user_doc.get("is_active", True),
            user_profile=user_doc.get("user_profile"),
            created_at=user_doc.get("created_at")
        )

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in_minutes=auth_service.expire_minutes,
            user=user_resp
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=TokenResponse)
async def login(req: UserLoginRequest):
    """
    Authenticates user email and password against stored BCrypt hash and returns JWT token.
    """
    user_doc = auth_service.get_user_by_email(req.email)
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Verify BCrypt password hash
    is_valid = auth_service.verify_password(req.password, user_doc.get("hashed_password", ""))
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user_doc.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact portal administrator."
        )

    # Update last login timestamp in MongoDB Atlas if available
    try:
        db = mongodb_manager.get_db()
        if db is not None:
            db["users"].update_one(
                {"user_id": user_doc["user_id"]},
                {"$set": {"last_login": datetime.datetime.utcnow()}}
            )
    except Exception:
        pass


    # Generate JWT token
    token_payload = {
        "sub": user_doc["user_id"],
        "user_id": user_doc["user_id"],
        "email": user_doc["email"],
        "role": user_doc["role"],
        "full_name": user_doc["full_name"]
    }
    access_token = auth_service.create_access_token(token_payload)

    user_resp = UserResponse(
        user_id=user_doc["user_id"],
        email=user_doc["email"],
        full_name=user_doc["full_name"],
        role=user_doc["role"],
        phone_number=user_doc.get("phone_number"),
        is_active=user_doc.get("is_active", True),
        user_profile=user_doc.get("user_profile"),
        created_at=user_doc.get("created_at")
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in_minutes=auth_service.expire_minutes,
        user=user_resp
    )

@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Returns current authenticated user details extracted from verified JWT token.
    """
    return UserResponse(
        user_id=current_user["user_id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        role=current_user["role"],
        phone_number=current_user.get("phone_number"),
        is_active=current_user.get("is_active", True),
        user_profile=current_user.get("user_profile"),
        created_at=current_user.get("created_at")
    )

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    req: UserProfileUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Updates authenticated citizen's saved profile in MongoDB Atlas for 1-click eligibility check.
    """
    auth_service.update_user_profile(current_user["user_id"], req.user_profile.dict())
    updated_user = auth_service.get_user_by_id(current_user["user_id"])
    return UserResponse(
        user_id=updated_user["user_id"],
        email=updated_user["email"],
        full_name=updated_user["full_name"],
        role=updated_user["role"],
        phone_number=updated_user.get("phone_number"),
        is_active=updated_user.get("is_active", True),
        user_profile=updated_user.get("user_profile"),
        created_at=updated_user.get("created_at")
    )

# ================= ADMIN ONLY ENDPOINTS =================
@router.get("/admin/users", response_model=AdminUserListResponse)
async def list_registered_users(
    limit: int = 100,
    current_user: Dict[str, Any] = Depends(require_role(["admin"]))
):
    """
    Admin-only route: Lists registered citizens & administrator accounts from MongoDB Atlas.
    """
    users_raw = auth_service.list_all_users(limit=limit)
    users_list = [
        UserResponse(
            user_id=u["user_id"],
            email=u["email"],
            full_name=u["full_name"],
            role=u.get("role", "user"),
            phone_number=u.get("phone_number"),
            is_active=u.get("is_active", True),
            user_profile=u.get("user_profile"),
            created_at=u.get("created_at")
        )
        for u in users_raw
    ]
    return AdminUserListResponse(total=len(users_list), users=users_list)

@router.get("/admin/stats")
async def get_admin_system_stats(
    current_user: Dict[str, Any] = Depends(require_role(["admin"]))
):
    """
    Admin-only route: Returns system and user demographic counts from MongoDB Atlas.
    """
    total_users = len(auth_service._in_memory_users)
    admin_users = sum(1 for u in auth_service._in_memory_users.values() if u.get("role") == "admin")
    citizen_users = sum(1 for u in auth_service._in_memory_users.values() if u.get("role") == "user")
    total_documents = 1

    try:
        if mongodb_manager.is_connected and mongodb_manager.db is not None:
            total_users = mongodb_manager.db["users"].count_documents({})
            admin_users = mongodb_manager.db["users"].count_documents({"role": "admin"})
            citizen_users = mongodb_manager.db["users"].count_documents({"role": "user"})
            total_documents = mongodb_manager.db["uploaded_documents"].count_documents({})
    except Exception:
        pass

    return {
        "total_registered_users": total_users,
        "admins_count": admin_users,
        "citizens_count": citizen_users,
        "uploaded_documents_in_atlas": total_documents,
        "auth_security": "JWT (HS256) + BCrypt (cost 12)",
        "admin_requester": current_user["email"]
    }

@router.patch("/admin/users/{user_id}/role", response_model=AdminUserActionResponse)
async def update_user_role(
    user_id: str,
    req: UpdateUserRoleRequest,
    current_user: Dict[str, Any] = Depends(require_role(["admin"]))
):
    """
    Admin-only route: Updates a user's role to 'admin' or 'user'.
    Prevents an admin from demoting their own account.
    """
    if req.role not in ["admin", "user"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be either 'admin' or 'user'."
        )

    if current_user["user_id"] == user_id and req.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot demote their own account. Ask another admin to change your role."
        )

    target_user = auth_service.get_user_by_id(user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID '{user_id}' not found."
        )

    updated = auth_service.update_user_role(user_id, req.role)
    user_resp = UserResponse(
        user_id=updated["user_id"],
        email=updated["email"],
        full_name=updated["full_name"],
        role=updated["role"],
        phone_number=updated.get("phone_number"),
        is_active=updated.get("is_active", True),
        user_profile=updated.get("user_profile"),
        created_at=updated.get("created_at")
    )

    return AdminUserActionResponse(
        success=True,
        message=f"User '{updated['full_name']}' role successfully updated to '{req.role}'.",
        user=user_resp
    )

@router.patch("/admin/users/{user_id}/status", response_model=AdminUserActionResponse)
async def update_user_status(
    user_id: str,
    req: UpdateUserStatusRequest,
    current_user: Dict[str, Any] = Depends(require_role(["admin"]))
):
    """
    Admin-only route: Activates or deactivates a user account.
    Prevents an admin from deactivating their own account.
    """
    if current_user["user_id"] == user_id and not req.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot deactivate their own account."
        )

    target_user = auth_service.get_user_by_id(user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID '{user_id}' not found."
        )

    updated = auth_service.update_user_status(user_id, req.is_active)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID '{user_id}' not found."
        )
    user_resp = UserResponse(
        user_id=updated["user_id"],
        email=updated["email"],
        full_name=updated["full_name"],
        role=updated["role"],
        phone_number=updated.get("phone_number"),
        is_active=updated.get("is_active", True),
        user_profile=updated.get("user_profile"),
        created_at=updated.get("created_at")
    )

    status_str = "activated" if req.is_active else "deactivated"
    return AdminUserActionResponse(
        success=True,
        message=f"User account '{updated['email']}' has been {status_str}.",
        user=user_resp
    )

@router.delete("/admin/users/{user_id}", response_model=AdminUserActionResponse)
async def delete_user_account(
    user_id: str,
    current_user: Dict[str, Any] = Depends(require_role(["admin"]))
):
    """
    Admin-only route: Deletes a user account.
    Prevents an admin from deleting their own account.
    """
    if current_user["user_id"] == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot delete their own account."
        )

    target_user = auth_service.get_user_by_id(user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID '{user_id}' not found."
        )

    deleted_email = target_user.get("email")
    success = auth_service.delete_user(user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user account."
        )

    return AdminUserActionResponse(
        success=True,
        message=f"User account '{deleted_email}' deleted successfully.",
        user=None
    )


# ================= OTP AUTHENTICATION & VERIFICATION ROUTES =================

@router.post("/otp/send", response_model=SendOtpResponse)
async def send_otp_code(req: SendOtpRequest):
    """
    Generates and dispatches a cryptographically secure 6-digit OTP to Email/Mobile.
    Enforces 30-second rate limiting cooldown and 5-minute TTL.
    """
    if not req.identifier or len(req.identifier.strip()) < 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid email address or 10-digit mobile number."
        )

    # If purpose is login, ensure user exists
    if req.purpose == "login":
        user = auth_service.get_user_by_identifier(req.identifier)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No registered citizen or admin account found for '{req.identifier}'. Please register first."
            )

    # If purpose is register, ensure email not already taken
    if req.purpose == "register" and "@" in req.identifier:
        user = auth_service.get_user_by_email(req.identifier)
        if user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"An account with email '{req.identifier}' already exists. Please sign in instead."
            )

    try:
        res = otp_service.send_otp(identifier=req.identifier, purpose=req.purpose)
        return SendOtpResponse(
            success=True,
            identifier=res["identifier"],
            purpose=res["purpose"],
            expires_in_seconds=res["expires_in_seconds"],
            message=res["message"]
        )

    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send OTP verification code: {str(e)}"
        )

@router.post("/otp/verify", response_model=VerifyOtpResponse)
async def verify_otp_code(req: VerifyOtpRequest):
    """
    Validates a submitted 6-digit OTP code. Returns verification token if valid.
    """
    success, msg, vtok = otp_service.verify_otp(
        identifier=req.identifier,
        otp_code=req.otp_code,
        purpose=req.purpose
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg
        )

    return VerifyOtpResponse(
        success=True,
        verified=True,
        message=msg,
        verification_token=vtok
    )

@router.post("/otp/login", response_model=TokenResponse)
async def login_with_otp(req: OtpLoginRequest):
    """
    Passwordless Instant Sign-In: Verifies 6-digit OTP and returns signed JWT access token.
    """
    user_doc = auth_service.get_user_by_identifier(req.identifier)
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No account found for '{req.identifier}'. Please sign up first."
        )

    # Validate OTP code
    success, msg, _ = otp_service.verify_otp(
        identifier=req.identifier,
        otp_code=req.otp_code,
        purpose="login"
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg
        )

    # Consume active session
    otp_service.consume_otp_session(req.identifier, "login")

    # Update last login timestamp
    try:
        if mongodb_manager.is_connected and mongodb_manager.db is not None:
            mongodb_manager.db["users"].update_one(
                {"user_id": user_doc["user_id"]},
                {"$set": {"last_login": datetime.datetime.utcnow()}}
            )
    except Exception:
        pass

    # Issue JWT token
    token_payload = {
        "sub": user_doc["user_id"],
        "user_id": user_doc["user_id"],
        "email": user_doc["email"],
        "role": user_doc["role"],
        "full_name": user_doc["full_name"]
    }
    access_token = auth_service.create_access_token(token_payload)

    user_resp = UserResponse(
        user_id=user_doc["user_id"],
        email=user_doc["email"],
        full_name=user_doc["full_name"],
        role=user_doc["role"],
        phone_number=user_doc.get("phone_number"),
        is_active=user_doc.get("is_active", True),
        user_profile=user_doc.get("user_profile"),
        created_at=user_doc.get("created_at")
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in_minutes=auth_service.expire_minutes,
        user=user_resp
    )

@router.post("/otp/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_with_otp(req: UserRegisterWithOtpRequest):
    """
    Registers a new citizen account with OTP verification and BCrypt password security.
    Accepts either an unconsumed verification_token (from Step 1) or direct 6-digit otp_code.
    """
    # 1. Verify OTP code or verification token for registration
    verified = False
    ver_err = "Please provide a valid 6-digit OTP code or verification token."

    if req.verification_token:
        if otp_service.is_verified_token_valid(req.email, req.verification_token, "register"):
            verified = True
        else:
            ver_err = "Verification token is invalid or expired. Please re-verify your OTP."

    if not verified and req.otp_code:
        success, msg, _ = otp_service.verify_otp(
            identifier=req.email,
            otp_code=req.otp_code,
            purpose="register"
        )
        if success:
            verified = True
        else:
            ver_err = msg

    if not verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"OTP verification failed: {ver_err}"
        )

    # 2. Check if user already exists
    existing = auth_service.get_user_by_email(req.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An account with email '{req.email}' is already registered. Please sign in instead."
        )

    # 3. Create account with BCrypt password hashing
    try:
        # All public self-registrations are strictly citizen accounts (role='user').
        assigned_role = "user"
        user_doc = auth_service.create_user(
            email=req.email,
            password=req.password,
            full_name=req.full_name,
            role=assigned_role,
            phone_number=req.phone_number
        )

        # Store profile preferences if provided
        if req.state or req.preferred_language:
            auth_service.update_user_profile(user_doc["user_id"], {
                "state": req.state or "Karnataka",
                "preferred_language": req.preferred_language or "en"
            })
            user_doc = auth_service.get_user_by_id(user_doc["user_id"])

        # Clean up OTP session
        otp_service.consume_otp_session(req.email, "register")

        # Generate JWT token
        token_payload = {
            "sub": user_doc["user_id"],
            "user_id": user_doc["user_id"],
            "email": user_doc["email"],
            "role": user_doc["role"],
            "full_name": user_doc["full_name"]
        }
        access_token = auth_service.create_access_token(token_payload)

        user_resp = UserResponse(
            user_id=user_doc["user_id"],
            email=user_doc["email"],
            full_name=user_doc["full_name"],
            role=user_doc["role"],
            phone_number=user_doc.get("phone_number"),
            is_active=user_doc.get("is_active", True),
            user_profile=user_doc.get("user_profile"),
            created_at=user_doc.get("created_at")
        )

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in_minutes=auth_service.expire_minutes,
            user=user_resp
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OTP Registration failed: {str(e)}"
        )


