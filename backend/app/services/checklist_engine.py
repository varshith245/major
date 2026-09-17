from typing import Optional, List
from ..models.schemas import Scheme, UserProfile, ChecklistResponse
from .data_loader import data_loader

class ChecklistEngine:
    def generate_checklist(self, scheme_id: str, profile: Optional[UserProfile] = None) -> ChecklistResponse:
        scheme = data_loader.get_scheme_by_id(scheme_id)
        if not scheme:
            scheme = data_loader.find_scheme_by_name(scheme_id)
        
        if not scheme or getattr(scheme, "status", "Active") != "Active":
            raise ValueError(f"Scheme with identifier '{scheme_id}' not found or is currently inactive.")

        mandatory = list(scheme.required_documents)
        optional = list(scheme.optional_documents)

        # Context-sensitive dynamic document additions
        if profile:
            if profile.caste_category in ["SC", "ST", "OBC", "EWS"] and not any("Caste" in d for d in mandatory):
                optional.append(f"{profile.caste_category} Category Certificate from Revenue Authority")
            if profile.annual_income > 0 and not any("Income" in d for d in mandatory):
                optional.append("Valid Annual Income Certificate (issued by Tehsildar/Revenue Officer)")
            if profile.owns_land and not any("Land" in d or "RoR" in d for d in mandatory):
                mandatory.append("Land Possession / Pahani (RTC) Record")

        # Step by step filing process guidance
        steps: List[str] = [
            "1. Document Preparation: Gather all self-attested mandatory documents listed above with original copies for verification.",
            "2. Bank & Aadhaar Linkage: Ensure your active bank savings account is seeded with Aadhaar and NPCI DBT enabled.",
            f"3. Application Submission: Visit the official portal ({scheme.application_link}) or visit nearest Common Service Center (CSC) / Gram One / Seva Sindhu center.",
            f"4. Submission & Acknowledgment: Submit the completed form along with document copies and obtain the official Application Tracking Acknowledgment Number.",
            f"5. Verification & Field Inspection: Local administrative nodal officers will inspect and verify eligibility within ~{scheme.processing_time_days} working days.",
            "6. Benefit Disbursement: Upon sanction, benefits/subsidies will be directly credited into your bank account via Direct Benefit Transfer (DBT)."
        ]

        helpline = scheme.grievance_contact or "Toll Free Helpline: 1800-11-0001"

        # Sanitize application link to a single valid URL
        portal_url = scheme.application_link.strip() if scheme.application_link else "https://www.india.gov.in"
        import re
        url_match = re.search(r'(https?://[^\s\)\],]+)', portal_url)
        if url_match:
            portal_url = url_match.group(1).rstrip(')/,;')

        return ChecklistResponse(
            scheme_id=scheme.scheme_id,
            scheme_name=scheme.scheme_name,
            mandatory_documents=mandatory,
            optional_documents=optional,
            step_by_step_process=steps,
            estimated_processing_days=scheme.processing_time_days,
            official_portal=portal_url,
            helpline=helpline
        )

checklist_engine = ChecklistEngine()
