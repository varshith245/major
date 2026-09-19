import json
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..config import SCHEMES_DATASET_PATH
from .models import (
    SchemeDB, EligibilityRuleDB, SchemeDocumentDB,
    UserAssessmentDB, UploadedDocumentDB, ChatHistoryDB,
    AuditLogDB, SystemSettingDB
)
from .connection import SessionLocal, Base, engine
from .mongodb import mongodb_manager

def init_db_and_seed():
    """
    Creates database tables and seeds scheme data in SQLite & MongoDB Atlas.
    """
    # 1. SQL Database Table Creation
    Base.metadata.create_all(bind=engine)

    # Safe raw SQLite column migrations BEFORE querying with ORM
    try:
        with engine.connect() as conn:
            scheme_cols = [row[1] for row in conn.execute(text("PRAGMA table_info(schemes)")).fetchall()]
            for col_name, col_sql in [
                ("status", "VARCHAR(50) DEFAULT 'Active'"),
                ("verification_status", "VARCHAR(50) DEFAULT 'Verified'"),
                ("source_url", "VARCHAR(500)"),
                ("last_verified_date", "DATETIME"),
                ("data_version", "VARCHAR(20) DEFAULT '1.0'"),
                ("updated_at", "DATETIME"),
                ("updated_by", "VARCHAR(255) DEFAULT 'admin@egovseva.gov.in'")
            ]:
                if col_name not in scheme_cols:
                    try:
                        conn.execute(text(f"ALTER TABLE schemes ADD COLUMN {col_name} {col_sql}"))
                        conn.commit()
                    except Exception:
                        pass

            chat_cols = [row[1] for row in conn.execute(text("PRAGMA table_info(chat_history)")).fetchall()]
            for col_name, col_sql in [
                ("confidence", "NUMERIC(4, 2) DEFAULT 0.90"),
                ("latency_ms", "INTEGER DEFAULT 120"),
                ("status", "VARCHAR(50) DEFAULT 'Success'")
            ]:
                if col_name not in chat_cols:
                    try:
                        conn.execute(text(f"ALTER TABLE chat_history ADD COLUMN {col_name} {col_sql}"))
                        conn.commit()
                    except Exception:
                        pass

            doc_cols = [row[1] for row in conn.execute(text("PRAGMA table_info(uploaded_documents)")).fetchall()]
            if "user_id" not in doc_cols:
                try:
                    conn.execute(text("ALTER TABLE uploaded_documents ADD COLUMN user_id VARCHAR(100)"))
                    conn.commit()
                except Exception:
                    pass
    except Exception as mig_err:
        print(f"[DatabaseSeeder] Safe migration notice: {mig_err}")

    db: Session = SessionLocal()
    schemes_data = []
    try:
        with open(SCHEMES_DATASET_PATH, "r", encoding="utf-8") as f:
            schemes_data = json.load(f)

        count = db.query(SchemeDB).count()
        rules_count = db.query(EligibilityRuleDB).count()
        if count == 0 or rules_count == 0:
            print("[DatabaseSeeder] Seeding SQL database with official schemes dataset...")
            if count > 0 and rules_count == 0:
                db.query(SchemeDocumentDB).delete()
                db.query(EligibilityRuleDB).delete()
                db.query(SchemeDB).delete()
                db.commit()

            for s in schemes_data:
                scheme_db = SchemeDB(
                    scheme_id=s["scheme_id"],
                    scheme_name=s["scheme_name"],
                    short_name=s["short_name"],
                    ministry=s["ministry"],
                    level=s.get("level", "Central"),
                    state=s.get("state", "All-India"),
                    category=s["category"],
                    description=s["description"],
                    key_benefits=s["key_benefits"],
                    benefit_amount=s.get("benefit_amount", 0.0),
                    application_link=s["application_link"],
                    offline_process=s.get("offline_process"),
                    grievance_contact=s.get("grievance_contact"),
                    processing_time_days=s.get("processing_time_days", 15),
                    tags=s.get("tags", [])
                )
                db.add(scheme_db)

                crit = s["eligibility_criteria"]
                rule_db = EligibilityRuleDB(
                    scheme_id=s["scheme_id"],
                    min_age=crit.get("min_age", 0),
                    max_age=crit.get("max_age", 120),
                    gender=crit.get("gender", "Any"),
                    max_annual_income=crit.get("max_annual_income"),
                    landholding_required=crit.get("landholding_required", False),
                    landholding_max_acres=crit.get("landholding_max_acres"),
                    allowed_occupations=crit.get("occupation", []),
                    allowed_castes=crit.get("caste_category", ["General", "OBC", "SC", "ST", "EWS"]),
                    exclusions=crit.get("exclusions", [])
                )
                db.add(rule_db)

                for req_doc in s.get("required_documents", []):
                    doc_db = SchemeDocumentDB(
                        scheme_id=s["scheme_id"],
                        document_name=req_doc,
                        is_mandatory=True
                    )
                    db.add(doc_db)

                for opt_doc in s.get("optional_documents", []):
                    doc_db = SchemeDocumentDB(
                        scheme_id=s["scheme_id"],
                        document_name=opt_doc,
                        is_mandatory=False
                    )
                    db.add(doc_db)
            db.commit()
            print(f"[DatabaseSeeder] Successfully seeded {len(schemes_data)} schemes into SQL DB.")
        else:
            print(f"[DatabaseSeeder] SQL Database already populated with {count} schemes.")

        # Safe column migration for existing SQLite tables
        try:
            inspector_cols = [row[1] for row in db.execute(text("PRAGMA table_info(schemes)")).fetchall()]
            if "status" not in inspector_cols:
                db.execute(text("ALTER TABLE schemes ADD COLUMN status VARCHAR(50) DEFAULT 'Active'"))
            if "verification_status" not in inspector_cols:
                db.execute(text("ALTER TABLE schemes ADD COLUMN verification_status VARCHAR(50) DEFAULT 'Verified'"))
            if "source_url" not in inspector_cols:
                db.execute(text("ALTER TABLE schemes ADD COLUMN source_url VARCHAR(500)"))
            if "last_verified_date" not in inspector_cols:
                db.execute(text("ALTER TABLE schemes ADD COLUMN last_verified_date DATETIME"))
            if "data_version" not in inspector_cols:
                db.execute(text("ALTER TABLE schemes ADD COLUMN data_version VARCHAR(20) DEFAULT '1.0'"))
            if "updated_at" not in inspector_cols:
                db.execute(text("ALTER TABLE schemes ADD COLUMN updated_at DATETIME"))
            if "updated_by" not in inspector_cols:
                db.execute(text("ALTER TABLE schemes ADD COLUMN updated_by VARCHAR(255) DEFAULT 'admin@egovseva.gov.in'"))

            # Chat history migration
            chat_cols = [row[1] for row in db.execute(text("PRAGMA table_info(chat_history)")).fetchall()]
            if "confidence" not in chat_cols:
                db.execute(text("ALTER TABLE chat_history ADD COLUMN confidence NUMERIC(4, 2) DEFAULT 0.90"))
            if "latency_ms" not in chat_cols:
                db.execute(text("ALTER TABLE chat_history ADD COLUMN latency_ms INTEGER DEFAULT 120"))
            if "status" not in chat_cols:
                db.execute(text("ALTER TABLE chat_history ADD COLUMN status VARCHAR(50) DEFAULT 'Success'"))

            db.commit()
        except Exception as mig_err:
            db.rollback()
            print(f"[DatabaseSeeder] Safe migration notice: {mig_err}")

        # Seed System Settings if empty
        if db.query(SystemSettingDB).count() == 0:
            default_setting = SystemSettingDB(
                app_name="AI Public Service Assistant for Government Schemes",
                default_language="en",
                session_timeout_minutes=1440,
                maintenance_mode=False,
                ai_confidence_threshold=0.70,
                pagination_size=20,
                allow_citizen_registration=True,
                notification_banner="National e-Governance Welfare Portal operating in high-availability mode.",
                updated_by="admin@egovseva.gov.in"
            )
            db.add(default_setting)
            db.commit()

        # Seed Initial Audit Log entry if empty or missing citizen events
        if db.query(AuditLogDB).count() == 0:
            init_audit = AuditLogDB(
                admin_email="admin@egovseva.gov.in",
                admin_name="Portal Administrator",
                action="SYSTEM_INITIALIZED",
                resource="system",
                resource_id="SYS-001",
                details={"event": "Database and RBAC Control Center successfully initialized"},
                ip_address="127.0.0.1",
                status="Success"
            )
            db.add(init_audit)
            db.commit()

        # Clean up any legacy synthetic application logs
        db.query(AuditLogDB).filter(AuditLogDB.action.in_(["APPLICATION_SUBMITTED", "DOCUMENT_UPLOADED"])).delete(synchronize_session=False)
        db.commit()

        # Seed sample assessments if table empty so admin charts have data
        if db.query(UserAssessmentDB).count() == 0:
            sample_assessments = [
                UserAssessmentDB(session_id="SES-001", user_age=35, user_gender="Male", user_state="Karnataka", user_occupation="Farmer", user_annual_income=120000.0, user_landholding_acres=2.5, matched_scheme_id="PM-KISAN", eligibility_status="Eligible", confidence_score=0.98, reasons=["Age between 18-70", "Owns agricultural land"]),
                UserAssessmentDB(session_id="SES-002", user_age=22, user_gender="Female", user_state="Karnataka", user_occupation="Student", user_annual_income=80000.0, user_landholding_acres=0.0, matched_scheme_id="YUVA-NIDHI", eligibility_status="Eligible", confidence_score=0.95, reasons=["Graduate citizen", "Unemployed"]),
                UserAssessmentDB(session_id="SES-003", user_age=45, user_gender="Male", user_state="Maharashtra", user_occupation="Business", user_annual_income=800000.0, user_landholding_acres=0.0, matched_scheme_id="PM-AWAS-U", eligibility_status="Not Eligible", confidence_score=0.92, reasons=["Income exceeds ceiling"]),
                UserAssessmentDB(session_id="SES-004", user_age=29, user_gender="Female", user_state="Tamil Nadu", user_occupation="Artisan", user_annual_income=150000.0, user_landholding_acres=0.0, matched_scheme_id="PM-SVANIDHI", eligibility_status="Likely Eligible", confidence_score=0.88, reasons=["Urban micro-entrepreneur"]),
                UserAssessmentDB(session_id="SES-005", user_age=62, user_gender="Male", user_state="All-India", user_occupation="Retired", user_annual_income=90000.0, user_landholding_acres=0.0, matched_scheme_id="PM-SYM", eligibility_status="Eligible", confidence_score=0.96, reasons=["Senior citizen category"])
            ]
            db.add_all(sample_assessments)
            db.commit()

        # Seed sample chat queries if table empty so admin query analytics have data
        if db.query(ChatHistoryDB).count() == 0:
            sample_chats = [
                ChatHistoryDB(session_id="SES-001", user_query="Am I eligible for PM Kisan installment?", detected_language="en", intent="eligibility_check", confidence=0.96, assistant_response="Based on your profile, you are eligible for PM-Kisan Samman Nidhi.", latency_ms=115, status="Success"),
                ChatHistoryDB(session_id="SES-002", user_query="ನಾನು ಪಿಎಂ ಆವಾಸ್ ಯೋಜನೆಗೆ ಹೇಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಬೇಕು?", detected_language="kn", intent="scheme_search", confidence=0.94, assistant_response="ಪಿಎಂ ಆವಾಸ್ ಯೋಜನೆಗೆ ಆನ್‌ಲೈನ್ ಪೋರ್ಟಲ್ ಮೂಲಕ ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದು.", latency_ms=140, status="Success"),
                ChatHistoryDB(session_id="SES-003", user_query="आयुष्मान भारत कार्ड के लिए आवश्यक दस्तावेज क्या हैं?", detected_language="hi", intent="document_query", confidence=0.95, assistant_response="आयुष्मान भारत के लिए आधार कार्ड और राशन कार्ड आवश्यक हैं।", latency_ms=130, status="Success"),
                ChatHistoryDB(session_id="SES-004", user_query="Compare PMAY Gramin vs Urban", detected_language="en", intent="comparison", confidence=0.98, assistant_response="Here is the side-by-side comparison of PMAY-G and PMAY-U.", latency_ms=160, status="Success"),
                ChatHistoryDB(session_id="SES-005", user_query="xyz random loan query with no category", detected_language="en", intent="scheme_search", confidence=0.55, assistant_response="Could you please specify your state and occupation?", latency_ms=110, status="Low Confidence")
            ]
            db.add_all(sample_chats)
            db.commit()
    except Exception as e:
        db.rollback()
        print(f"[DatabaseSeeder] SQL Seeding error: {e}")
    finally:
        db.close()

    # 2. MongoDB Atlas Seeding / Synchronization
    try:
        mongo_db = mongodb_manager.get_db()
        if mongo_db is not None and schemes_data:
            schemes_coll = mongo_db["schemes"]
            if schemes_coll.count_documents({}) == 0:
                print("[MongoDB Atlas] Seeding schemes collection in Atlas...")
                schemes_coll.insert_many(schemes_data)
                print(f"[MongoDB Atlas] Seeded {len(schemes_data)} schemes in Atlas database 'egovseva_db'.")
            else:
                print(f"[MongoDB Atlas] Schemes collection has {schemes_coll.count_documents({})} schemes.")

            # 3. Seed Default Admin and Citizen Accounts
            users_coll = mongo_db["users"]
            # Create unique index on email
            users_coll.create_index("email", unique=True)
            users_coll.create_index("user_id", unique=True)

            from ..services.auth_service import auth_service
            import datetime

            # Check Admin
            admin_email = "admin@egovseva.gov.in"
            if not users_coll.find_one({"email": admin_email}):
                admin_doc = {
                    "user_id": "USR-ADMIN001",
                    "email": admin_email,
                    "full_name": "Portal Administrator",
                    "hashed_password": auth_service.hash_password("Admin@12345"),
                    "role": "admin",
                    "phone_number": "1800-11-0001",
                    "is_active": True,
                    "user_profile": None,
                    "created_at": datetime.datetime.utcnow(),
                    "last_login": None
                }
                users_coll.insert_one(admin_doc)
                print(f"[MongoDB Atlas] Seeded default administrator account: {admin_email} (Role: admin)")

            # Ensure duplicate legacy demo citizen account is completely purged
            users_coll.delete_many({"$or": [{"email": "citizen@egovseva.gov.in"}, {"user_id": "USR-CITIZEN01"}]})

            # Seed Varshith D personal email account
            varshith_email = "varshithvarshithd@gmail.com"
            if not users_coll.find_one({"email": varshith_email}):
                varshith_doc = {
                    "user_id": "USR-VARSHITH01",
                    "email": varshith_email,
                    "full_name": "Varshith D",
                    "hashed_password": auth_service.hash_password("gov@123"),
                    "role": "user",
                    "phone_number": "9876543210",
                    "is_active": True,
                    "user_profile": {
                        "age": 22,
                        "gender": "Male",
                        "state": "Karnataka",
                        "district": "Bengaluru",
                        "occupation": "Farmer",
                        "annual_income": 150000.0,
                        "owns_land": True,
                        "landholding_acres": 2.0,
                        "caste_category": "General",
                        "is_govt_employee": False,
                        "is_income_tax_payer": False,
                        "owns_pucca_house": False,
                        "is_bpl_cardholder": False,
                        "is_head_of_family": True
                    },
                    "created_at": datetime.datetime.utcnow(),
                    "last_login": None
                }
                users_coll.insert_one(varshith_doc)
                print(f"[MongoDB Atlas] Seeded personal citizen account: {varshith_email} (Role: user)")

            # Purge any synthetic demo applications so that only genuine citizen applications exist
            apps_coll = mongo_db["applications"]
            apps_coll.delete_many({})
            mongo_db["application_journey"].delete_many({})

    except Exception as me:
        print(f"[MongoDB Atlas] Seeding notice: {me}")


