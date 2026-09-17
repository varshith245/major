from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .connection import Base

class SchemeDB(Base):
    __tablename__ = "schemes"

    scheme_id = Column(String(50), primary_key=True, index=True)
    scheme_name = Column(String(255), nullable=False, index=True)
    short_name = Column(String(50), nullable=False, index=True)
    ministry = Column(String(255), nullable=False, index=True)
    level = Column(String(20), default="Central")
    state = Column(String(100), default="All-India", index=True)
    category = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=False)
    key_benefits = Column(Text, nullable=False)
    benefit_amount = Column(Numeric(12, 2), default=0.0)
    application_link = Column(String(255), nullable=False)
    offline_process = Column(Text, nullable=True)
    grievance_contact = Column(String(255), nullable=True)
    processing_time_days = Column(Integer, default=15)
    tags = Column(JSON, default=list)
    status = Column(String(50), default="Active")
    verification_status = Column(String(50), default="Verified")
    source_url = Column(String(500), nullable=True)
    last_verified_date = Column(DateTime, default=datetime.utcnow)
    data_version = Column(String(20), default="1.0")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(String(255), default="admin@egovseva.gov.in")

    # Relationships
    eligibility_rules = relationship("EligibilityRuleDB", back_populates="scheme", cascade="all, delete-orphan")
    documents = relationship("SchemeDocumentDB", back_populates="scheme", cascade="all, delete-orphan")

class EligibilityRuleDB(Base):
    __tablename__ = "eligibility_rules"

    id = Column(Integer, primary_key=True, autoincrement=True)
    scheme_id = Column(String(50), ForeignKey("schemes.scheme_id"), nullable=False)
    min_age = Column(Integer, default=0)
    max_age = Column(Integer, default=120)
    gender = Column(String(20), default="Any")
    max_annual_income = Column(Numeric(12, 2), nullable=True)
    landholding_required = Column(Boolean, default=False)
    landholding_max_acres = Column(Numeric(6, 2), nullable=True)
    allowed_occupations = Column(JSON, default=list)
    allowed_castes = Column(JSON, default=list)
    exclusions = Column(JSON, default=list)

    scheme = relationship("SchemeDB", back_populates="eligibility_rules")

class SchemeDocumentDB(Base):
    __tablename__ = "scheme_documents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    scheme_id = Column(String(50), ForeignKey("schemes.scheme_id"), nullable=False)
    document_name = Column(String(255), nullable=False)
    is_mandatory = Column(Boolean, default=True)

    scheme = relationship("SchemeDB", back_populates="documents")

class UserAssessmentDB(Base):
    __tablename__ = "user_assessments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(100), index=True)
    user_age = Column(Integer)
    user_gender = Column(String(20))
    user_state = Column(String(100))
    user_occupation = Column(String(100))
    user_annual_income = Column(Numeric(12, 2))
    user_landholding_acres = Column(Numeric(6, 2))
    matched_scheme_id = Column(String(50))
    eligibility_status = Column(String(50))
    confidence_score = Column(Numeric(4, 2))
    reasons = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

class UploadedDocumentDB(Base):
    __tablename__ = "uploaded_documents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(100), nullable=True, index=True)
    scheme_id = Column(String(50), nullable=True)
    document_type = Column(String(100), nullable=False)
    original_filename = Column(String(255), nullable=False)
    cloudinary_url = Column(String(500), nullable=False)
    cloudinary_public_id = Column(String(255), nullable=False)
    file_size_bytes = Column(Integer)
    verification_status = Column(String(50), default="Pending")
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatHistoryDB(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(100), index=True)
    user_query = Column(Text, nullable=False)
    detected_language = Column(String(10), default="en")
    intent = Column(String(50))
    confidence = Column(Numeric(4, 2), default=0.90)
    assistant_response = Column(Text, nullable=False)
    audio_url = Column(String(500), nullable=True)
    latency_ms = Column(Integer, default=120)
    status = Column(String(50), default="Success")  # "Success", "Low Confidence", "Failed"
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLogDB(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    admin_email = Column(String(255), nullable=False)
    admin_name = Column(String(255), nullable=False)
    action = Column(String(100), nullable=False, index=True)
    resource = Column(String(100), nullable=False, index=True)
    resource_id = Column(String(100), nullable=True)
    details = Column(JSON, default=dict)
    ip_address = Column(String(100), default="127.0.0.1")
    status = Column(String(50), default="Success")

class SystemSettingDB(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    app_name = Column(String(255), default="AI Public Service Assistant for Government Schemes")
    default_language = Column(String(10), default="en")
    session_timeout_minutes = Column(Integer, default=1440)
    maintenance_mode = Column(Boolean, default=False)
    ai_confidence_threshold = Column(Numeric(4, 2), default=0.70)
    pagination_size = Column(Integer, default=20)
    allow_citizen_registration = Column(Boolean, default=True)
    notification_banner = Column(String(500), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(String(255), default="admin@egovseva.gov.in")
