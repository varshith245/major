import pytest
from backend.app.models.schemas import UserProfile
from backend.app.services.data_loader import data_loader
from backend.app.services.eligibility_engine import eligibility_engine

def test_farmer_pm_kisan_eligible():
    farmer_profile = UserProfile(
        age=42,
        gender="Male",
        state="Karnataka",
        occupation="Farmer",
        annual_income=120000,
        owns_land=True,
        landholding_acres=2.5,
        caste_category="OBC",
        is_govt_employee=False,
        is_income_tax_payer=False
    )
    
    pm_kisan = data_loader.get_scheme_by_id("GOI-AGRI-001")
    result = eligibility_engine.evaluate_scheme(pm_kisan, farmer_profile)
    
    assert result.is_eligible is True
    assert result.eligibility_status in ["Likely Eligible", "Conditionally Eligible"]
    assert result.confidence_score >= 0.70

def test_tax_payer_pm_kisan_ineligible():
    tax_payer_profile = UserProfile(
        age=38,
        gender="Male",
        state="Karnataka",
        occupation="Software Engineer",
        annual_income=1500000,
        owns_land=True,
        landholding_acres=1.0,
        caste_category="General",
        is_govt_employee=False,
        is_income_tax_payer=True
    )
    
    pm_kisan = data_loader.get_scheme_by_id("GOI-AGRI-001")
    result = eligibility_engine.evaluate_scheme(pm_kisan, tax_payer_profile)
    
    assert result.is_eligible is False
    assert result.eligibility_status == "Not Eligible"
    assert any("tax" in r.lower() for r in result.missing_criteria)

def test_girl_child_sukanya_samriddhi():
    girl_profile = UserProfile(
        age=7,
        gender="Female",
        state="Karnataka",
        occupation="Student",
        annual_income=0,
        owns_land=False,
        caste_category="General"
    )
    
    ssy = data_loader.get_scheme_by_id("GOI-WMN-005")
    result = eligibility_engine.evaluate_scheme(ssy, girl_profile)
    
    assert result.is_eligible is True
    assert result.confidence_score >= 0.70

def test_senior_citizen_pension_bpl():
    senior_profile = UserProfile(
        age=67,
        gender="Female",
        state="Karnataka",
        occupation="Elderly",
        annual_income=24000,
        owns_land=False,
        is_bpl_cardholder=True,
        caste_category="SC"
    )
    
    ignoaps = data_loader.get_scheme_by_id("GOI-SOC-007")
    result = eligibility_engine.evaluate_scheme(ignoaps, senior_profile)
    
    assert result.is_eligible is True
    assert result.confidence_score >= 0.70
