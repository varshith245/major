import secrets
import datetime
import uuid
from typing import Optional, Dict, Any, Tuple
from ..database.mongodb import mongodb_manager
from .email_service import email_service

class OtpService:
    def __init__(self):
        # In-memory store for active OTP sessions: key = f"{normalized_identifier}:{purpose}"
        self._active_otps: Dict[str, Dict[str, Any]] = {}
        self.otp_ttl_seconds = 300  # 5 minutes
        self.max_attempts = 3
        self.resend_cooldown_seconds = 30

    def _get_key(self, identifier: str, purpose: str) -> str:
        return f"{identifier.strip().lower()}:{purpose.strip().lower()}"

    def send_otp(self, identifier: str, purpose: str = "login", force_resend: bool = False) -> Dict[str, Any]:
        """
        Generates and records a cryptographically secure 6-digit OTP for the given email/mobile.
        Sends a real email to the user's inbox if identifier contains '@'.
        Enforces 30-second resend cooldown unless force_resend=True.
        """
        norm_id = identifier.strip().lower()
        key = self._get_key(norm_id, purpose)
        now = datetime.datetime.utcnow()

        # Check resend cooldown
        existing = self._active_otps.get(key)
        if not force_resend and existing and (now - existing["last_sent_at"]).total_seconds() < self.resend_cooldown_seconds:
            remaining = int(self.resend_cooldown_seconds - (now - existing["last_sent_at"]).total_seconds())
            raise ValueError(f"Please wait {remaining} seconds before requesting a new OTP.")

        # Generate non-predictable 6-digit OTP
        code = f"{secrets.randbelow(900000) + 100000}"
        expires_at = now + datetime.timedelta(seconds=self.otp_ttl_seconds)

        session_data = {
            "identifier": norm_id,
            "purpose": purpose,
            "otp_code": code,
            "created_at": now,
            "last_sent_at": now,
            "expires_at": expires_at,
            "attempts": 0,
            "is_verified": False,
            "verification_token": None
        }

        # Store in memory
        self._active_otps[key] = session_data
        print(f"[OTP SERVICE] >>> Generated OTP for {norm_id} ({purpose}): {code} <<<")

        # Store in MongoDB Atlas if available
        try:
            if mongodb_manager.is_connected and mongodb_manager.db is not None:
                mongodb_manager.db["otp_sessions"].update_one(
                    {"key": key},
                    {"$set": session_data.copy()},
                    upsert=True
                )
        except Exception:
            pass

        # Send Real Email if identifier is an email address
        if "@" in norm_id:
            try:
                email_service.send_otp_email(to_email=norm_id, otp_code=code, purpose=purpose)
            except Exception as e:
                print(f"[OTP SERVICE WARNING] Email delivery notice: {e}")
                # If Brevo fails in local/test environment, keep session alive so citizen can proceed
                # using console or test OTP
                return {
                    "success": True,
                    "identifier": norm_id,
                    "purpose": purpose,
                    "expires_in_seconds": self.otp_ttl_seconds,
                    "message": f"6-digit verification code generated for {norm_id}. (Note: SMTP warning: {str(e)[:80]})"
                }

        return {
            "success": True,
            "identifier": norm_id,
            "purpose": purpose,
            "expires_in_seconds": self.otp_ttl_seconds,
            "message": f"6-digit verification code sent directly to your email ({norm_id}). Please check your inbox or spam folder."
        }


    def verify_otp(self, identifier: str, otp_code: str, purpose: str = "login") -> Tuple[bool, str, Optional[str]]:
        """
        Validates a submitted 6-digit OTP code against the active session.
        Returns: (success: bool, message: str, verification_token: Optional[str])
        """
        norm_id = identifier.strip().lower()
        clean_code = otp_code.strip()
        key = self._get_key(norm_id, purpose)
        now = datetime.datetime.utcnow()

        session = self._active_otps.get(key)
        if not session:
            # Check Atlas fallback
            try:
                if mongodb_manager.is_connected and mongodb_manager.db is not None:
                    db_sess = mongodb_manager.db["otp_sessions"].find_one({"key": key})
                    if db_sess:
                        session = db_sess
                        self._active_otps[key] = session
            except Exception:
                pass

        if not session:
            return False, "No active OTP request found. Please request a new OTP code.", None

        # Check expiration
        if now > session["expires_at"]:
            self._active_otps.pop(key, None)
            return False, "The OTP has expired. Please request a fresh 6-digit code.", None

        # If already verified with same code
        if session.get("is_verified") and session.get("otp_code") == clean_code:
            return True, "OTP verified successfully.", session.get("verification_token")

        # Check attempt limits
        if session["attempts"] >= self.max_attempts:
            self._active_otps.pop(key, None)
            return False, "Too many incorrect attempts. This OTP has been invalidated. Please request a new code.", None

        # Validate code
        if session["otp_code"] != clean_code:
            session["attempts"] += 1
            remaining = self.max_attempts - session["attempts"]
            return False, f"Invalid OTP code. {remaining} attempt(s) remaining.", None

        # Successful verification!
        ver_token = f"VTOK-{uuid.uuid4().hex[:12].upper()}"
        session["is_verified"] = True
        session["verification_token"] = ver_token

        # Update in Atlas
        try:
            if mongodb_manager.is_connected and mongodb_manager.db is not None:
                mongodb_manager.db["otp_sessions"].update_one(
                    {"key": key},
                    {"$set": {"is_verified": True, "verification_token": ver_token}}
                )
        except Exception:
            pass

        return True, "OTP verified successfully.", ver_token

    def is_verified_token_valid(self, identifier: str, verification_token: str, purpose: str) -> bool:
        """
        Checks if an identifier holds a valid, unconsumed verification token.
        """
        key = self._get_key(identifier, purpose)
        session = self._active_otps.get(key)
        if not session:
            try:
                if mongodb_manager.is_connected and mongodb_manager.db is not None:
                    db_sess = mongodb_manager.db["otp_sessions"].find_one({"key": key})
                    if db_sess:
                        session = db_sess
                        self._active_otps[key] = session
            except Exception:
                pass

        if session and session.get("is_verified") and session.get("verification_token") == verification_token:
            return True
        return False

    def consume_otp_session(self, identifier: str, purpose: str) -> None:
        """
        Cleans up the OTP session once consumed for login or registration.
        """
        key = self._get_key(identifier, purpose)
        self._active_otps.pop(key, None)
        try:
            if mongodb_manager.is_connected and mongodb_manager.db is not None:
                mongodb_manager.db["otp_sessions"].delete_one({"key": key})
        except Exception:
            pass

otp_service = OtpService()
