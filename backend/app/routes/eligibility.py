from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from ..models.schemas import UserProfile, EligibilityEvaluationResponse, EligibilityResult, SimulationRequest, SimulationResponse
from ..services.eligibility_engine import eligibility_engine
from ..services.data_loader import data_loader

router = APIRouter(prefix="/api/eligibility", tags=["Eligibility Engine"])

@router.post("/evaluate", response_model=EligibilityEvaluationResponse)
def evaluate_profile(profile: UserProfile):
    results = eligibility_engine.evaluate_all(profile)
    eligible_count = sum(1 for r in results if r.is_eligible)

    # Persist in UserAssessmentDB for real admin analytics & charts
    try:
        from ..database.connection import SessionLocal
        from ..database.models import UserAssessmentDB
        db = SessionLocal()
        top_eligible = next((r for r in results if r.is_eligible), None) or (results[0] if results else None)
        if top_eligible:
            entry = UserAssessmentDB(
                session_id="SES-WIZARD",
                user_age=profile.age,
                user_gender=profile.gender,
                user_state=profile.state,
                user_occupation=profile.occupation,
                user_annual_income=profile.annual_income,
                user_landholding_acres=profile.landholding_acres,
                matched_scheme_id=top_eligible.scheme_id,
                eligibility_status="Eligible" if top_eligible.is_eligible else "Not Eligible",
                confidence_score=0.95 if top_eligible.is_eligible else 0.85,
                reasons=top_eligible.matched_criteria if top_eligible.is_eligible else top_eligible.unmet_criteria
            )
            db.add(entry)
            db.commit()
        db.close()
    except Exception as e:
        print(f"[EligibilityRoute] Notice: Could not log assessment to DB: {e}")

    return EligibilityEvaluationResponse(
        total_evaluated=len(results),
        eligible_count=eligible_count,
        results=results
    )

@router.post("/check-scheme/{scheme_id}", response_model=EligibilityResult)
def evaluate_specific_scheme(scheme_id: str, profile: UserProfile):
    scheme = data_loader.get_scheme_by_id(scheme_id) or data_loader.find_scheme_by_name(scheme_id)
    if not scheme or getattr(scheme, "status", "Active") != "Active":
        raise HTTPException(status_code=404, detail="Scheme not found or is currently inactive")
    return eligibility_engine.evaluate_scheme(scheme, profile)

@router.post("/simulate", response_model=SimulationResponse)
def simulate_what_if_scenario(req: SimulationRequest):
    # 1. Evaluate base profile
    base_results = eligibility_engine.evaluate_all(req.base_profile)
    base_eligible_ids = set(r.scheme_id for r in base_results if r.is_eligible)

    # 2. Apply modifications to create simulated profile
    profile_dict = req.base_profile.model_dump()
    for k, v in req.modified_fields.items():
        if k in profile_dict:
            profile_dict[k] = v
    
    simulated_profile = UserProfile(**profile_dict)
    sim_results = eligibility_engine.evaluate_all(simulated_profile)
    sim_eligible_ids = set(r.scheme_id for r in sim_results if r.is_eligible)

    newly_eligible = [
        data_loader.get_scheme_by_id(sid).short_name 
        for sid in (sim_eligible_ids - base_eligible_ids) 
        if data_loader.get_scheme_by_id(sid)
    ]
    newly_ineligible = [
        data_loader.get_scheme_by_id(sid).short_name 
        for sid in (base_eligible_ids - sim_eligible_ids) 
        if data_loader.get_scheme_by_id(sid)
    ]

    return SimulationResponse(
        original_eligible_count=len(base_eligible_ids),
        simulated_eligible_count=len(sim_eligible_ids),
        difference=len(sim_eligible_ids) - len(base_eligible_ids),
        newly_eligible_schemes=newly_eligible,
        newly_ineligible_schemes=newly_ineligible,
        results=sim_results
    )
