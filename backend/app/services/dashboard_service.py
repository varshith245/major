# backend/app/services/dashboard_service.py

"""Service functions for the citizen dashboard.
All data is stored in MongoDB Atlas via `mongodb_manager`.
Each function queries the appropriate collection and returns Pydantic models
defined in `schemas.py`.
"""

from typing import List

from ..models import schemas
from ..database.mongodb import mongodb_manager

# Ensure a database connection (real or mongomock) is initialized for the service layer.
# This call is safe even if a test fixture later overwrites the manager's client/db.


# Collection names – adjust if your DB uses different names
_SAVED_SCHEMES_COL = "saved_schemes"
_RECENT_VIEWS_COL = "scheme_views"
_ELIGIBILITY_HISTORY_COL = "eligibility_history"
_CHECKLIST_PROGRESS_COL = "checklist_progress"
_APPLICATION_JOURNEY_COL = "application_journey"
_NOTIFICATIONS_COL = "notifications"
_CHAT_HISTORY_COL = "chat_history"


def _clean(doc: dict = None) -> dict:
    d = dict(doc or {})
    d.pop("_id", None)
    return d


def _default_scheme(doc: dict = None) -> dict:
    d = _clean(doc)
    base = {
        "scheme_id": d.get("scheme_id", "SCHEME-DEFAULT"),
        "scheme_name": d.get("scheme_name", ""),
        "short_name": d.get("short_name", d.get("scheme_name", "")),
        "ministry": d.get("ministry", ""),
        "category": d.get("category", ""),
        "description": d.get("description", ""),
        "key_benefits": d.get("key_benefits", ""),
        "benefit_amount": float(d.get("benefit_amount", 0.0) or 0.0),
        "eligibility_criteria": d.get("eligibility_criteria", {
            "min_age": 0,
            "max_age": 120,
            "gender": "Any",
            "occupation": [],
            "max_annual_income": None,
            "landholding_required": False,
            "landholding_max_acres": None,
            "caste_category": ["General", "OBC", "SC", "ST", "EWS"],
            "target_group": None,
            "exclusions": []
        }),
        "required_documents": d.get("required_documents", []),
        "optional_documents": d.get("optional_documents", []),
        "application_link": d.get("application_link", ""),
        "offline_process": d.get("offline_process", None),
        "grievance_contact": d.get("grievance_contact", None),
        "processing_time_days": d.get("processing_time_days", 15),
        "tags": d.get("tags", []),
        "status": d.get("status", "Active"),
        "verification_status": d.get("verification_status", "Verified"),
        "source_url": d.get("source_url", None),
        "last_verified_date": d.get("last_verified_date", None),
        "data_version": d.get("data_version", "1.0"),
        "created_at": d.get("created_at", None),
        "updated_at": d.get("updated_at", None),
        "updated_by": d.get("updated_by", None),
    }
    base.update(d)
    return base


def _default_eligibility_result(doc: dict = None) -> dict:
    d = _clean(doc)
    is_el = bool(d.get("is_eligible", d.get("eligible", False)))
    base = {
        "scheme_id": d.get("scheme_id", "SCHEME-DEFAULT"),
        "scheme_name": d.get("scheme_name", ""),
        "short_name": d.get("short_name", d.get("scheme_name", "")),
        "category": d.get("category", ""),
        "benefit_amount": float(d.get("benefit_amount", 0.0) or 0.0),
        "eligibility_status": d.get("eligibility_status", "Eligible" if is_el else "Not Eligible"),
        "confidence_score": float(d.get("confidence_score", 1.0 if is_el else 0.0)),
        "is_eligible": is_el,
        "reasons": d.get("reasons", ["Criteria evaluated"]),
        "missing_criteria": d.get("missing_criteria", []),
        "required_documents": d.get("required_documents", []),
        "application_link": d.get("application_link", ""),
        "offline_process": d.get("offline_process", None),
    }
    base.update(d)
    return base


def _default_checklist_response(doc: dict = None) -> dict:
    d = _clean(doc)
    base = {
        "scheme_id": d.get("scheme_id", "SCHEME-DEFAULT"),
        "scheme_name": d.get("scheme_name", d.get("checklist_name", "")),
        "mandatory_documents": d.get("mandatory_documents", []),
        "optional_documents": d.get("optional_documents", []),
        "step_by_step_process": d.get("step_by_step_process", []),
        "estimated_processing_days": int(d.get("estimated_processing_days", 15)),
        "official_portal": d.get("official_portal", ""),
        "helpline": d.get("helpline", ""),
    }
    base.update(d)
    return base


def _default_application_journey(doc: dict = None) -> dict:
    d = _clean(doc)
    base = {
        "scheme_id": d.get("scheme_id", "SCHEME-DEFAULT"),
        "scheme_name": d.get("scheme_name", d.get("stage_name", "")),
        "current_stage": d.get("current_stage", d.get("stage_name", "Applied")),
        "stage_order": int(d.get("stage_order", 1)),
    }
    base.update(d)
    return base


def _default_notification(doc: dict = None) -> dict:
    d = _clean(doc)
    base = {
        "message": d.get("message", ""),
        "created_at": d.get("created_at", None),
    }
    base.update(d)
    return base


def _default_chat_response(doc: dict = None) -> dict:
    d = _clean(doc)
    base = {
        "query": d.get("query", d.get("message", "")),
        "detected_language": d.get("detected_language", "en"),
        "intent": d.get("intent", "general_inquiry"),
        "confidence": float(d.get("confidence", 1.0)),
        "answer": d.get("answer", d.get("response", "")),
        "audio_url": d.get("audio_url", None),
        "matched_schemes": d.get("matched_schemes", []),
        "suggested_actions": d.get("suggested_actions", []),
    }
    base.update(d)
    return base


def _get_collection(name: str):
    db = mongodb_manager.get_db()
    if not db:
        raise RuntimeError("MongoDB is not connected")
    return db[name]


async def get_saved_schemes(user_id: str) -> List[schemas.Scheme]:
    col = _get_collection(_SAVED_SCHEMES_COL)
    docs = col.find({"user_id": user_id})
    return [schemas.Scheme(**_default_scheme(doc)) for doc in docs]


async def get_recent_views(user_id: str) -> List[schemas.Scheme]:
    col = _get_collection(_RECENT_VIEWS_COL)
    docs = col.find({"user_id": user_id}).sort("viewed_at", -1).limit(10)
    return [schemas.Scheme(**_default_scheme(doc)) for doc in docs]


async def get_eligibility_history(user_id: str) -> List[schemas.EligibilityResult]:
    col = _get_collection(_ELIGIBILITY_HISTORY_COL)
    docs = col.find({"user_id": user_id}).sort("evaluated_at", -1)
    return [schemas.EligibilityResult(**_default_eligibility_result(doc)) for doc in docs]


async def get_checklist_progress(user_id: str) -> List[schemas.ChecklistResponse]:
    col = _get_collection(_CHECKLIST_PROGRESS_COL)
    docs = col.find({"user_id": user_id})
    return [schemas.ChecklistResponse(**_default_checklist_response(doc)) for doc in docs]


async def get_application_journey(user_id: str) -> List[schemas.ApplicationJourney]:
    col = _get_collection(_APPLICATION_JOURNEY_COL)
    docs = col.find({"user_id": user_id}).sort("stage_order", 1)
    return [schemas.ApplicationJourney(**_default_application_journey(doc)) for doc in docs]


async def get_upcoming_deadlines(user_id: str) -> List[schemas.Scheme]:
    saved_col = _get_collection(_SAVED_SCHEMES_COL)
    user_saved = list(saved_col.find({"user_id": user_id}))
    user_scheme_ids = {s.get("scheme_id") for s in user_saved if s.get("scheme_id")}

    journey_col = _get_collection(_APPLICATION_JOURNEY_COL)
    user_journey = list(journey_col.find({"user_id": user_id}))
    user_scheme_ids.update({j.get("scheme_id") for j in user_journey if j.get("scheme_id")})

    from datetime import datetime, timedelta
    now = datetime.utcnow()
    upcoming = now + timedelta(days=30)
    now_iso = now.isoformat()
    upcoming_iso = upcoming.isoformat()

    col = _get_collection("schemes")
    or_clauses = [
        {"user_id": user_id},
        {"user_id": None},
    ]
    if user_scheme_ids:
        or_clauses.append({"scheme_id": {"$in": list(user_scheme_ids)}})

    query_filter = {
        "application_deadline": {
            "$gte": now_iso,
            "$lte": upcoming_iso
        },
        "$or": or_clauses
    }

    docs = list(col.find(query_filter).sort("application_deadline", 1))

    if not docs and user_saved:
        for s in user_saved:
            dl = s.get("application_deadline")
            if dl and now_iso <= str(dl) <= upcoming_iso:
                docs.append(s)

    return [schemas.Scheme(**_default_scheme(doc)) for doc in docs]


async def get_notifications(user_id: str) -> List[schemas.Notification]:
    col = _get_collection(_NOTIFICATIONS_COL)
    docs = col.find({"user_id": user_id}).sort("created_at", -1)
    return [schemas.Notification(**_default_notification(doc)) for doc in docs]


async def get_recent_chat(user_id: str) -> List[schemas.ChatResponse]:
    col = _get_collection(_CHAT_HISTORY_COL)
    docs = col.find({"user_id": user_id}).sort("timestamp", -1).limit(5)
    return [schemas.ChatResponse(**_default_chat_response(doc)) for doc in docs]


async def update_language_preference(user_id: str, language: str) -> None:
    users_col = _get_collection("users")
    users_col.update_one({"user_id": user_id}, {"$set": {"preferred_language": language}})
