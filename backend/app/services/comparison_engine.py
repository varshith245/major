from typing import List, Dict, Any
from ..models.schemas import Scheme, ComparisonResponse
from .data_loader import data_loader

class ComparisonEngine:
    def compare_schemes(self, scheme_ids: List[str]) -> ComparisonResponse:
        schemes: List[Scheme] = []
        for sid in scheme_ids:
            s = data_loader.get_scheme_by_id(sid) or data_loader.find_scheme_by_name(sid)
            if s and getattr(s, "status", "Active") == "Active" and s not in schemes:
                schemes.append(s)
        
        if not schemes:
            raise ValueError("No active schemes found for comparison.")

        fields: Dict[str, Any] = {
            "names": [s.scheme_name for s in schemes],
            "short_names": [s.short_name for s in schemes],
            "ministries": [s.ministry for s in schemes],
            "levels": [f"{s.level} ({s.state})" for s in schemes],
            "categories": [s.category for s in schemes],
            "benefit_amounts": [f"₹{s.benefit_amount:,.0f}" if s.benefit_amount > 0 else "Subsidy / In-Kind" for s in schemes],
            "key_benefits": [s.key_benefits for s in schemes],
            "age_criteria": [f"{s.eligibility_criteria.min_age} to {s.eligibility_criteria.max_age} years" for s in schemes],
            "income_limits": [f"Up to ₹{s.eligibility_criteria.max_annual_income:,.0f}" if s.eligibility_criteria.max_annual_income else "No strict limit" for s in schemes],
            "landholding_rules": ["Mandatory (Landowners only)" if s.eligibility_criteria.landholding_required else "Not mandatory" for s in schemes],
            "required_documents": [", ".join(s.required_documents[:3]) + f" (+{len(s.required_documents)-3} more)" if len(s.required_documents) > 3 else ", ".join(s.required_documents) for s in schemes],
            "processing_times": [f"{s.processing_time_days} days" for s in schemes],
            "application_portals": [s.application_link for s in schemes]
        }

        return ComparisonResponse(schemes=schemes, comparison_fields=fields)

comparison_engine = ComparisonEngine()
