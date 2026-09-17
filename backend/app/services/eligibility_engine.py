from typing import List, Dict, Any, Tuple
from ..models.schemas import Scheme, UserProfile, EligibilityResult
from .data_loader import data_loader

class EligibilityEngine:
    def evaluate_scheme(self, scheme: Scheme, profile: UserProfile) -> EligibilityResult:
        crit = scheme.eligibility_criteria
        reasons: List[str] = []
        missing_criteria: List[str] = []
        is_hard_pass = True
        score = 1.0

        # 1. State check
        if scheme.state != "All-India" and scheme.state.lower() != profile.state.lower():
            is_hard_pass = False
            missing_criteria.append(f"State restriction: Designated for {scheme.state} residents.")
            reasons.append(f"Applicant is in {profile.state}, but scheme is for {scheme.state}.")
            score -= 0.6
        else:
            reasons.append(f"Meets state residency criteria ({scheme.state}).")

        # 2. Age criteria
        if profile.age < crit.min_age:
            is_hard_pass = False
            missing_criteria.append(f"Minimum age required is {crit.min_age} years (current: {profile.age}).")
            reasons.append(f"Applicant age ({profile.age}) is below minimum requirement ({crit.min_age}).")
            score -= 0.4
        elif profile.age > crit.max_age:
            is_hard_pass = False
            missing_criteria.append(f"Maximum age limit is {crit.max_age} years (current: {profile.age}).")
            reasons.append(f"Applicant age ({profile.age}) exceeds limit ({crit.max_age}).")
            score -= 0.4
        else:
            reasons.append(f"Age ({profile.age}) satisfies eligibility window ({crit.min_age}–{crit.max_age} yrs).")

        # 3. Gender criteria
        if crit.gender != "Any" and crit.gender.lower() != profile.gender.lower():
            is_hard_pass = False
            missing_criteria.append(f"Scheme is designated exclusively for {crit.gender} beneficiaries.")
            reasons.append(f"Applicant gender ({profile.gender}) does not match required gender ({crit.gender}).")
            score -= 0.5
        elif crit.gender != "Any":
            reasons.append(f"Gender ({profile.gender}) matches scheme target group.")

        # 4. Income ceiling
        if crit.max_annual_income is not None:
            if profile.annual_income > crit.max_annual_income:
                is_hard_pass = False
                missing_criteria.append(f"Annual income ceiling is ₹{crit.max_annual_income:,.0f} (current: ₹{profile.annual_income:,.0f}).")
                reasons.append(f"Income ₹{profile.annual_income:,.0f} exceeds maximum threshold ₹{crit.max_annual_income:,.0f}.")
                score -= 0.35
            else:
                reasons.append(f"Annual income (₹{profile.annual_income:,.0f}) is within eligible limit (₹{crit.max_annual_income:,.0f}).")

        # 5. Landholding criteria
        if crit.landholding_required:
            if not profile.owns_land:
                is_hard_pass = False
                missing_criteria.append("Ownership of cultivable agricultural land is mandatory.")
                reasons.append("Applicant does not own agricultural land.")
                score -= 0.4
            else:
                reasons.append(f"Applicant owns agricultural land ({profile.landholding_acres or 0:.1f} acres).")
                if crit.landholding_max_acres is not None and (profile.landholding_acres or 0) > crit.landholding_max_acres:
                    is_hard_pass = False
                    missing_criteria.append(f"Landholding exceeds maximum limit of {crit.landholding_max_acres} acres.")
                    score -= 0.3

        # 6. Occupation and Category Matching
        occ_matches = any(
            o.lower() in profile.occupation.lower() or profile.occupation.lower() in o.lower()
            for o in crit.occupation
        ) if crit.occupation and "Any" not in crit.occupation else True

        if occ_matches:
            reasons.append(f"Occupation ({profile.occupation}) is aligned with scheme benefits.")
        else:
            score -= 0.15
            reasons.append(f"Target occupation list: {', '.join(crit.occupation[:3])}.")

        # 7. Disqualification checks (Govt employee, Tax payer, Pucca house)
        if profile.is_govt_employee and any("government" in ex.lower() or "regular employment" in ex.lower() for ex in crit.exclusions):
            is_hard_pass = False
            missing_criteria.append("Government employees are excluded under scheme guidelines.")
            score -= 0.5

        if profile.is_income_tax_payer and any("tax" in ex.lower() for ex in crit.exclusions):
            is_hard_pass = False
            missing_criteria.append("Income tax payers are excluded under scheme guidelines.")
            score -= 0.4

        if profile.owns_pucca_house and ("PMAY" in scheme.short_name or "Awas" in scheme.scheme_name):
            is_hard_pass = False
            missing_criteria.append("Beneficiaries owning an existing pucca house are not eligible.")
            score -= 0.6

        # Calculate final confidence score and status
        final_score = max(0.0, min(1.0, score if is_hard_pass else score * 0.45))
        
        if is_hard_pass and final_score >= 0.70:
            status = "Likely Eligible"
            eligible_flag = True
        elif is_hard_pass and final_score >= 0.50:
            status = "Conditionally Eligible"
            eligible_flag = True
        else:
            status = "Not Eligible"
            eligible_flag = False

        return EligibilityResult(
            scheme_id=scheme.scheme_id,
            scheme_name=scheme.scheme_name,
            short_name=scheme.short_name,
            category=scheme.category,
            benefit_amount=scheme.benefit_amount,
            eligibility_status=status,
            confidence_score=round(final_score, 2),
            is_eligible=eligible_flag,
            reasons=reasons,
            missing_criteria=missing_criteria,
            required_documents=scheme.required_documents,
            application_link=scheme.application_link,
            offline_process=scheme.offline_process
        )

    def evaluate_all(self, profile: UserProfile, include_inactive: bool = False) -> List[EligibilityResult]:
        schemes = data_loader.get_all_schemes(include_inactive=include_inactive)
        results = [self.evaluate_scheme(s, profile) for s in schemes]
        results.sort(key=lambda x: (x.is_eligible, x.confidence_score, x.benefit_amount), reverse=True)
        return results

eligibility_engine = EligibilityEngine()
