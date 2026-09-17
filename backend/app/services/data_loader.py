import json
from typing import List, Dict, Any, Optional
from ..config import SCHEMES_DATASET_PATH, ELIGIBILITY_RULES_PATH, NLP_INTENT_PATH, MULTILINGUAL_PATH
from ..models.schemas import Scheme, EligibilityCriteria

class DataLoader:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DataLoader, cls).__new__(cls)
            # Ensure eligibility_rules attribute exists even if DB load succeeds without JSON fallback
            cls._instance.eligibility_rules = []
            cls._instance._load_data()
        return cls._instance

    def _load_data(self):
        loaded_from_db = False
        try:
            from ..database.connection import SessionLocal
            from ..database.models import SchemeDB, EligibilityRuleDB, SchemeDocumentDB
            db = SessionLocal()
            db_schemes = db.query(SchemeDB).all()
            if db_schemes and len(db_schemes) > 0:
                schemes_list: List[Scheme] = []
                rules_map: Dict[str, Dict[str, Any]] = {}
                for s in db_schemes:
                    rule = db.query(EligibilityRuleDB).filter(EligibilityRuleDB.scheme_id == s.scheme_id).first()
                    crit = EligibilityCriteria(
                        min_age=rule.min_age if rule else 0,
                        max_age=rule.max_age if rule else 120,
                        gender=rule.gender if rule else "Any",
                        occupation=rule.allowed_occupations if rule and rule.allowed_occupations else [],
                        max_annual_income=float(rule.max_annual_income) if rule and rule.max_annual_income is not None else None,
                        landholding_required=rule.landholding_required if rule else False,
                        landholding_max_acres=float(rule.landholding_max_acres) if rule and rule.landholding_max_acres is not None else None,
                        caste_category=rule.allowed_castes if rule and rule.allowed_castes else ["General", "OBC", "SC", "ST", "EWS"],
                        exclusions=rule.exclusions if rule and rule.exclusions else []
                    )
                    docs = db.query(SchemeDocumentDB).filter(SchemeDocumentDB.scheme_id == s.scheme_id).all()
                    req_docs = [d.document_name for d in docs if d.is_mandatory]
                    opt_docs = [d.document_name for d in docs if not d.is_mandatory]

                    # Fall back to dataset docs if database records have not populated docs yet
                    if not req_docs and not opt_docs:
                        req_docs = ["Aadhaar Card", "Bank Account Details"]
                        opt_docs = ["Income Certificate", "Residence Certificate"]

                    scheme_obj = Scheme(
                        scheme_id=s.scheme_id,
                        scheme_name=s.scheme_name,
                        short_name=s.short_name,
                        ministry=s.ministry,
                        level=s.level or "Central",
                        state=s.state or "All-India",
                        category=s.category,
                        description=s.description or "",
                        key_benefits=s.key_benefits or "",
                        benefit_amount=float(s.benefit_amount or 0.0),
                        eligibility_criteria=crit,
                        required_documents=req_docs,
                        optional_documents=opt_docs,
                        application_link=s.application_link or "",
                        offline_process=s.offline_process,
                        grievance_contact=s.grievance_contact,
                        processing_time_days=s.processing_time_days or 15,
                        tags=s.tags or [],
                        status=s.status or "Active",
                        verification_status=s.verification_status or "Verified",
                        source_url=s.source_url,
                        last_verified_date=s.last_verified_date.strftime("%Y-%m-%d") if s.last_verified_date else None,
                        data_version=s.data_version or "1.0"
                    )
                    schemes_list.append(scheme_obj)
                    rules_map[s.scheme_id] = {
                        "scheme_id": s.scheme_id,
                        "min_age": crit.min_age,
                        "max_age": crit.max_age,
                        "gender": crit.gender,
                        "max_annual_income": crit.max_annual_income,
                        "landholding_required": crit.landholding_required,
                        "landholding_max_acres": crit.landholding_max_acres,
                        "occupation": crit.occupation,
                        "caste_category": crit.caste_category,
                        "exclusions": crit.exclusions
                    }

                self.schemes = schemes_list
                self.scheme_map = {s.scheme_id: s for s in self.schemes}
                self.short_name_map = {s.short_name.lower(): s for s in self.schemes}
                self.rules_map = rules_map
                loaded_from_db = True
            db.close()
        except Exception as e:
            print(f"[DataLoader] DB loading note: {e}, falling back to JSON files")

        if not loaded_from_db:
            with open(SCHEMES_DATASET_PATH, "r", encoding="utf-8") as f:
                self.schemes_raw: List[Dict[str, Any]] = json.load(f)
                self.schemes: List[Scheme] = [Scheme(**s) for s in self.schemes_raw]
                self.scheme_map: Dict[str, Scheme] = {s.scheme_id: s for s in self.schemes}
                self.short_name_map: Dict[str, Scheme] = {s.short_name.lower(): s for s in self.schemes}

            with open(ELIGIBILITY_RULES_PATH, "r", encoding="utf-8") as f:
                self.eligibility_rules: List[Dict[str, Any]] = json.load(f)
                self.rules_map: Dict[str, Dict[str, Any]] = {r["scheme_id"]: r for r in self.eligibility_rules}

        with open(NLP_INTENT_PATH, "r", encoding="utf-8") as f:
            self.nlp_intents: Dict[str, Any] = json.load(f)

        with open(MULTILINGUAL_PATH, "r", encoding="utf-8") as f:
            self.multilingual: Dict[str, Any] = json.load(f)

    def get_all_schemes(self, include_inactive: bool = True) -> List[Scheme]:
        if include_inactive:
            return self.schemes
        return [s for s in self.schemes if getattr(s, "status", "Active") == "Active"]

    def get_scheme_by_id(self, scheme_id: str) -> Optional[Scheme]:
        return self.scheme_map.get(scheme_id)

    def find_scheme_by_name(self, name_fragment: str) -> Optional[Scheme]:
        name_lower = name_fragment.lower().strip()
        for scheme in self.schemes:
            if name_lower in scheme.short_name.lower() or name_lower in scheme.scheme_name.lower():
                return scheme
        return None

    def get_rules_for_scheme(self, scheme_id: str) -> Optional[Dict[str, Any]]:
        return self.rules_map.get(scheme_id)

    def register_or_update_scheme(self, scheme_obj: Scheme):
        """
        Dynamically registers or updates a scheme in memory and triggers vector index refresh.
        """
        self.scheme_map[scheme_obj.scheme_id] = scheme_obj
        self.short_name_map[scheme_obj.short_name.lower()] = scheme_obj

        # Update in list
        replaced = False
        for idx, s in enumerate(self.schemes):
            if s.scheme_id == scheme_obj.scheme_id:
                self.schemes[idx] = scheme_obj
                replaced = True
                break
        if not replaced:
            self.schemes.insert(0, scheme_obj)

        # Update rules map
        crit = scheme_obj.eligibility_criteria
        self.rules_map[scheme_obj.scheme_id] = {
            "scheme_id": scheme_obj.scheme_id,
            "min_age": crit.min_age,
            "max_age": crit.max_age,
            "gender": crit.gender,
            "max_annual_income": crit.max_annual_income,
            "landholding_required": crit.landholding_required,
            "landholding_max_acres": crit.landholding_max_acres,
            "occupation": crit.occupation,
            "caste_category": crit.caste_category,
            "exclusions": crit.exclusions
        }

        # Refresh Vector search index
        try:
            from .vector_engine import vector_engine
            vector_engine._build_index()
        except Exception:
            pass

        # Also persist to schemes_dataset.json as cold backup
        try:
            dump_fn = getattr(scheme_obj, "model_dump", None) or getattr(scheme_obj, "dict", None)
            schemes_json = [
                (getattr(s, "model_dump", None) or getattr(s, "dict", None))() for s in self.schemes
            ]
            with open(SCHEMES_DATASET_PATH, "w", encoding="utf-8") as f:
                json.dump(schemes_json, f, ensure_ascii=False, indent=2, default=str)
        except Exception as err:
            print(f"[DataLoader] Backup JSON sync note: {err}")

    def remove_scheme(self, scheme_id: str) -> bool:
        """
        Removes a scheme from active in-memory cache.
        """
        if scheme_id in self.scheme_map:
            removed = self.scheme_map.pop(scheme_id)
            self.short_name_map.pop(removed.short_name.lower(), None)
            self.schemes = [s for s in self.schemes if s.scheme_id != scheme_id]
            self.rules_map.pop(scheme_id, None)
            try:
                from .vector_engine import vector_engine
                vector_engine._build_index()
            except Exception:
                pass

            # Sync to schemes_dataset.json as cold backup
            try:
                schemes_json = [
                    (getattr(s, "model_dump", None) or getattr(s, "dict", None))() for s in self.schemes
                ]
                with open(SCHEMES_DATASET_PATH, "w", encoding="utf-8") as f:
                    json.dump(schemes_json, f, ensure_ascii=False, indent=2, default=str)
            except Exception:
                pass

            return True
        return False

data_loader = DataLoader()
