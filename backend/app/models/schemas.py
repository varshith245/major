from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict, model_validator
from datetime import datetime

class EligibilityCriteria(BaseModel):
    min_age: int = 0
    max_age: int = 120
    gender: str = "Any"
    occupation: List[str] = []
    max_annual_income: Optional[float] = None
    landholding_required: bool = False
    landholding_max_acres: Optional[float] = None
    caste_category: List[str] = ["General", "OBC", "SC", "ST", "EWS"]
    target_group: Optional[str] = None
    exclusions: List[str] = []

class Scheme(BaseModel):
    model_config = ConfigDict(extra="allow")
    scheme_id: str
    scheme_name: str
    short_name: str
    ministry: str
    level: str = "Central"
    state: str = "All-India"
    category: str
    description: str
    key_benefits: str
    benefit_amount: float = 0.0
    eligibility_criteria: EligibilityCriteria
    required_documents: List[str] = []
    optional_documents: List[str] = []
    application_link: str
    offline_process: Optional[str] = None
    grievance_contact: Optional[str] = None
    processing_time_days: int = 15
    tags: List[str] = []
    status: Optional[str] = "Active"
    verification_status: Optional[str] = "Verified"
    source_url: Optional[str] = None
    last_verified_date: Optional[str] = None
    data_version: Optional[str] = "1.0"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    updated_by: Optional[str] = None

class UserProfile(BaseModel):
    age: Optional[int] = Field(30, ge=0, le=120)
    gender: Optional[str] = Field("Any", pattern="^(Male|Female|Transgender|Other|Any)$")
    state: str = "Karnataka"
    occupation: str = "Farmer"
    annual_income: Optional[float] = Field(100000.0, ge=0)
    owns_land: bool = False
    landholding_acres: Optional[float] = 0.0
    caste_category: str = "General"
    is_govt_employee: bool = False
    is_income_tax_payer: bool = False
    owns_pucca_house: bool = False
    is_bpl_cardholder: bool = False
    is_head_of_family: bool = False
    education_qualification: Optional[str] = "None"
    graduation_year: Optional[int] = None
    is_employed: Optional[bool] = False

class EligibilityResult(BaseModel):
    model_config = ConfigDict(extra="allow")
    scheme_id: str
    scheme_name: str
    short_name: str
    category: str
    benefit_amount: float
    eligibility_status: str  # "Likely Eligible", "Conditionally Eligible", "Not Eligible"
    confidence_score: float  # 0.0 to 1.0
    is_eligible: bool
    reasons: List[str]
    missing_criteria: List[str]
    required_documents: List[str]
    application_link: str
    offline_process: Optional[str]

class EligibilityEvaluationResponse(BaseModel):
    total_evaluated: int
    eligible_count: int
    results: List[EligibilityResult]

class SimulationRequest(BaseModel):
    base_profile: UserProfile
    modified_fields: Dict[str, Any]

class SimulationResponse(BaseModel):
    original_eligible_count: int
    simulated_eligible_count: int
    difference: int
    newly_eligible_schemes: List[str]
    newly_ineligible_schemes: List[str]
    results: List[EligibilityResult]

class ChatRequest(BaseModel):
    query: Optional[str] = None
    message: Optional[str] = None
    language: Optional[str] = "en"  # "en", "hi", "kn"
    session_id: Optional[str] = "default_session"
    user_profile: Optional[UserProfile] = None

    @model_validator(mode="before")
    @classmethod
    def resolve_query_message(cls, data: Any) -> Any:
        if isinstance(data, dict):
            q = data.get("query")
            m = data.get("message")
            if not q and m:
                data["query"] = m
            elif not m and q:
                data["message"] = q
            if not data.get("query"):
                raise ValueError("A 'query' or 'message' string is required.")
        return data

class ChatResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    query: str
    detected_language: str
    intent: str
    confidence: float
    answer: str
    audio_url: Optional[str] = None
    matched_schemes: List[Scheme] = []
    eligibility_results: Optional[List[EligibilityResult]] = None
    suggested_actions: List[str] = []

class ComparisonRequest(BaseModel):
    scheme_ids: List[str]

class ComparisonResponse(BaseModel):
    schemes: List[Scheme]
    comparison_fields: Dict[str, Any]

class ChecklistRequest(BaseModel):
    scheme_id: str
    user_profile: Optional[UserProfile] = None

class ChecklistResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    scheme_id: str
    scheme_name: str
    mandatory_documents: List[str]
    optional_documents: List[str]
    step_by_step_process: List[str]
    estimated_processing_days: int
    official_portal: str
    helpline: str

class ApplicationJourney(BaseModel):
    model_config = ConfigDict(extra="allow")
    scheme_id: str
    scheme_name: str
    current_stage: str
    stage_order: int


class DocumentUploadResponse(BaseModel):
    success: bool
    message: str
    scheme_id: Optional[str] = None
    document_type: str
    file_id: Optional[str] = None
    file_url: Optional[str] = None
    mongodb_id: Optional[str] = None
    user_id: Optional[str] = None
    storage_provider: str = "MongoDB Atlas"
    cloudinary_url: Optional[str] = None
    cloudinary_public_id: Optional[str] = None
    file_size_bytes: int = 0
    verification_status: str = "Uploaded"

class DocumentVerificationCheck(BaseModel):
    name: str
    passed: bool
    details: str

class DocumentVerificationResponse(BaseModel):
    success: bool
    verified: bool
    document_type: str
    original_filename: str
    file_id: Optional[str] = None
    file_url: Optional[str] = None
    readiness_score: int
    legibility_status: str  # "High", "Medium", "Low"
    mime_type: str
    file_size_kb: float
    checks: List[DocumentVerificationCheck]
    extracted_info: Dict[str, str] = {}
    message: str
    recommendations: List[str] = []


class CategoryStat(BaseModel):
    category: str
    count: int
    total_benefit_potential: float

class StatsResponse(BaseModel):
    total_schemes: int
    central_schemes_count: int
    state_schemes_count: int
    total_categories: int
    categories: List[CategoryStat]
    average_processing_days: float
    total_benefit_pool: float
    mongodb_storage_active: bool = True
    database_engine: str = "MongoDB Atlas"
    cloudinary_storage_active: bool = False

# ================= AUTHENTICATION & RBAC SCHEMAS =================
class UserRole(str):
    ADMIN = "admin"
    USER = "user"

class UserRegisterRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=6)
    full_name: str
    phone_number: Optional[str] = None
    role: Optional[str] = "user"  # "admin" or "user"

class UserLoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    user_id: str
    email: str
    full_name: str
    role: str = "user"  # "admin" or "user"
    phone_number: Optional[str] = None
    is_active: bool = True
    user_profile: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_minutes: int
    user: UserResponse

class UserProfileUpdateRequest(BaseModel):
    user_profile: UserProfile

class AdminUserListResponse(BaseModel):
    total: int
    users: List[UserResponse]

class UpdateUserRoleRequest(BaseModel):
    role: str  # "admin" or "user"

class UpdateUserStatusRequest(BaseModel):
    is_active: bool

class AdminUserActionResponse(BaseModel):
    success: bool
    message: str
    user: Optional[UserResponse] = None


# ================= OTP VERIFICATION SCHEMAS =================
class SendOtpRequest(BaseModel):
    identifier: str  # Email or Mobile Number
    purpose: str = "login"  # "login", "register", "verify"

class SendOtpResponse(BaseModel):
    success: bool
    identifier: str
    purpose: str
    expires_in_seconds: int = 300
    message: str


class VerifyOtpRequest(BaseModel):
    identifier: str
    otp_code: str = Field(..., min_length=6, max_length=6)
    purpose: str = "login"

class VerifyOtpResponse(BaseModel):
    success: bool
    verified: bool
    message: str
    verification_token: Optional[str] = None
    token_response: Optional[TokenResponse] = None

class OtpLoginRequest(BaseModel):
    identifier: str
    otp_code: str = Field(..., min_length=6, max_length=6)

class UserRegisterWithOtpRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=6)
    full_name: str
    phone_number: Optional[str] = None
    role: Optional[str] = "user"
    otp_code: Optional[str] = None
    verification_token: Optional[str] = None
    state: Optional[str] = None
    preferred_language: Optional[str] = None

# ================= ADMIN PORTAL SCHEMAS =================
class SchemeCreateUpdateRequest(BaseModel):
    scheme_id: Optional[str] = None
    scheme_name: str
    short_name: str
    ministry: str
    level: str = "Central"
    state: str = "All-India"
    category: str
    description: str
    key_benefits: str
    benefit_amount: float = 0.0
    eligibility_criteria: EligibilityCriteria
    required_documents: List[str] = []
    optional_documents: List[str] = []
    application_link: str
    offline_process: Optional[str] = None
    grievance_contact: Optional[str] = None
    processing_time_days: int = 15
    tags: List[str] = []
    status: str = "Active"
    verification_status: str = "Verified"
    source_url: Optional[str] = None

class SchemeStatusUpdateRequest(BaseModel):
    status: str  # "Active", "Inactive", "Archived"

class EligibilityRuleTesterRequest(BaseModel):
    scheme_id: Optional[str] = None
    age: int = 30
    gender: str = "Male"
    state: str = "Karnataka"
    occupation: str = "Farmer"
    annual_income: float = 120000.0
    owns_land: bool = True
    landholding_acres: float = 2.0
    caste_category: str = "OBC"

class EligibilityRuleTesterResponse(BaseModel):
    scheme_id: str
    scheme_name: str
    status: str
    confidence_score: float
    matched_criteria: List[str]
    unmatched_criteria: List[str]
    reason: str

class SystemSettingUpdateRequest(BaseModel):
    app_name: Optional[str] = None
    default_language: Optional[str] = None
    session_timeout_minutes: Optional[int] = None
    maintenance_mode: Optional[bool] = None
    ai_confidence_threshold: Optional[float] = None
    pagination_size: Optional[int] = None
    allow_citizen_registration: Optional[bool] = None
    notification_banner: Optional[str] = None

class Notification(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: Optional[str] = None
    user_id: Optional[str] = None
    title: Optional[str] = None
    message: str
    type: Optional[str] = "STATUS_UPDATE"
    scheme_id: Optional[str] = None
    scheme_name: Optional[str] = None
    application_id: Optional[str] = None
    reference_no: Optional[str] = None
    channels_dispatched: Optional[List[str]] = ["in_app", "sms_simulated", "email_simulated"]
    is_read: bool = False
    action_url: Optional[str] = None
    created_at: Optional[Any] = None

class NotificationUnreadCountResponse(BaseModel):
    unread_count: int

class NotificationMarkReadResponse(BaseModel):
    success: bool
    message: str
    updated_count: Optional[int] = 1

class AuditLogEntry(BaseModel):
    id: int
    timestamp: str
    admin_email: str
    admin_name: str
    action: str
    resource: str
    resource_id: Optional[str] = None
    details: Dict[str, Any] = {}
    ip_address: Optional[str] = "127.0.0.1"
    status: str = "Success"

class ApplicationCreateRequest(BaseModel):
    model_config = ConfigDict(extra="allow")
    scheme_id: str
    scheme_name: str
    category: str
    reference_no: Optional[str] = None
    portal_url: Optional[str] = None
    status: Optional[str] = "Submitted"
    current_stage: Optional[str] = "Application Submitted"
    stage_order: Optional[int] = Field(default=1, ge=1, le=5)
    notes: Optional[str] = None

class ApplicationResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str
    user_id: str
    scheme_id: str
    scheme_name: str
    category: str
    reference_no: str
    status: str
    current_stage: str
    stage_order: int
    submission_date: str
    last_updated: str
    portal_url: str
    notes: Optional[str] = None
    sanction_amount: Optional[float] = None
    missing_documents: Optional[List[str]] = None

class ApplicationStatusUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="allow")
    status: Optional[str] = None
    current_stage: Optional[str] = None
    stage_order: Optional[int] = Field(default=None, ge=1, le=5)
    notes: Optional[str] = None
    action_type: Optional[str] = None
    missing_documents: Optional[List[str]] = None
    sanction_amount: Optional[float] = None

