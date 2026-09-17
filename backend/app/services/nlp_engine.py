import re
from typing import Dict, Any, List, Optional, Tuple
from ..models.schemas import ChatRequest, ChatResponse, Scheme, UserProfile, EligibilityResult
from .data_loader import data_loader
from .vector_engine import vector_engine
from .eligibility_engine import eligibility_engine
from .checklist_engine import checklist_engine
from .comparison_engine import comparison_engine
from .multilingual_engine import multilingual_engine
from .voice_engine import voice_engine

class NLPEngine:
    def __init__(self):
        self.intent_keywords = {
            "greeting": ["hi", "hello", "hey", "namaste", "namaskara", "help", "good morning", "good evening", "how are you"],
            "eligibility_check": ["eligible", "eligibility", "can i apply", "am i qualify", "can i get", "am i eligible", "check if i", "patra", "arharu", "yogya"],
            "document_query": ["document", "documents", "checklist", "papers", "id proof", "certificate", "records", "dastavez", "daakhale"],
            "comparison": ["compare", "vs", "versus", "difference between", "better than", "which is best", "tulana", "holike"],
            "scheme_search": ["scheme", "yojana", "search", "find", "list", "subsidy", "loan", "pension", "scholarship", "farmer", "student", "women"]
        }

    def classify_intent(self, text: str) -> Tuple[str, float]:
        text_clean = re.sub(r"[^\w\s]", " ", text.lower()).strip()
        tokens = set(text_clean.split())
        
        # Check comparison first
        if any(w in text_clean for w in ["compare", " vs ", "versus", "difference between", "tulana", "holike"]):
            return "comparison", 0.95
        
        # Check greeting
        if any(w in tokens for w in ["hi", "hello", "hey", "namaste", "namaskara", "help"]):
            return "greeting", 0.98
        
        # Check document query
        if any(w in text_clean for w in self.intent_keywords["document_query"]) or any(w in tokens for w in ["documents", "document", "papers", "checklist"]):
            return "document_query", 0.92
        
        # Check eligibility check
        if any(w in text_clean for w in self.intent_keywords["eligibility_check"]) or any(w in tokens for w in ["eligible", "eligibility", "qualify"]):
            return "eligibility_check", 0.94
        
        # Default to scheme_search
        return "scheme_search", 0.88

    def extract_mentioned_schemes(self, text: str) -> List[Scheme]:
        text_lower = text.lower()
        matched: List[Scheme] = []
        for s in data_loader.get_all_schemes(include_inactive=False):
            if s.short_name.lower() in text_lower or s.scheme_name.lower() in text_lower:
                matched.append(s)
            elif s.short_name.lower().replace("-", " ") in text_lower:
                matched.append(s)
            elif any(tag.lower() in text_lower for tag in s.tags if len(tag) > 3):
                if s not in matched:
                    matched.append(s)
        return matched

    def process_chat(self, req: ChatRequest) -> ChatResponse:
        query = req.query.strip()
        detected_lang = multilingual_engine.detect_language(query)
        if req.language and req.language in ["en", "hi", "kn"]:
            lang = detected_lang if detected_lang != "en" else req.language
        else:
            lang = detected_lang

        intent, confidence = self.classify_intent(query)
        matched_schemes: List[Scheme] = []
        eligibility_results: Optional[List[EligibilityResult]] = None
        suggested_actions: List[str] = []
        answer = ""

        if intent == "greeting":
            answer = multilingual_engine.translate_intent_response(intent, {}, lang)
            if lang == "kn":
                suggested_actions = [
                    "ನಾನು ಪಿಎಂ ಕಿಸಾನ್‌ಗೆ ಅರ್ಹನೇ?",
                    "ಆಯುಷ್ಮಾನ್ ಭಾರತ್‌ಗೆ ಬೇಕಾದ ದಾಖಲೆಗಳು?",
                    "ಕರ್ನಾಟಕ ಗ್ಯಾರಂಟಿ ಯೋಜನೆಗಳು",
                    "ಪಿಎಂ ಆವಾಸ್ ಗ್ರಾಮೀಣ vs ನಗರ ಹೋಲಿಕೆ"
                ]
            elif lang == "hi":
                suggested_actions = [
                    "क्या मैं पीएम किसान के लिए पात्र हूं?",
                    "आयुष्मान भारत के लिए आवश्यक दस्तावेज?",
                    "कर्नाटक गारंटी योजनाएं",
                    "पीएम आवास ग्रामीण बनाम शहरी"
                ]
            else:
                suggested_actions = [
                    "Am I eligible for PM Kisan?",
                    "What documents are needed for Ayushman Bharat?",
                    "Explore Karnataka guarantee schemes",
                    "Compare PMAY Gramin vs PMAY Urban"
                ]

        elif intent == "comparison":
            mentioned = self.extract_mentioned_schemes(query)
            if len(mentioned) < 2:
                results = vector_engine.search(query, top_k=2)
                mentioned = [r[0] for r in results]
            
            matched_schemes = mentioned[:3]
            answer = multilingual_engine.translate_intent_response(intent, {"schemes": matched_schemes}, lang)
            s_name = matched_schemes[0].short_name if matched_schemes else ""
            if lang == "kn":
                suggested_actions = [
                    f"{s_name} ಗಾಗಿ ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ" if s_name else "ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ",
                    f"{s_name} ದಾಖಲೆಗಳ ಪಟ್ಟಿ ಪಡೆಯಿರಿ" if s_name else "ದಾಖಲೆಗಳ ಪಟ್ಟಿ",
                    "ಎಲ್ಲಾ ಯೋಜನೆಗಳ ಪಟ್ಟಿ ವೀಕ್ಷಿಸಿ"
                ]
            elif lang == "hi":
                suggested_actions = [
                    f"{s_name} के लिए पात्रता जांचें" if s_name else "पात्रता जांचें",
                    f"{s_name} दस्तावेज़ चेकलिस्ट देखें" if s_name else "दस्तावेज़ चेकलिस्ट",
                    "सभी योजनाएं देखें"
                ]
            else:
                suggested_actions = [
                    f"Check eligibility for {s_name}" if s_name else "Check eligibility",
                    f"Get document checklist for {s_name}" if s_name else "Document checklist",
                    "Explore all citizen schemes"
                ]

        elif intent == "document_query":
            mentioned = self.extract_mentioned_schemes(query)
            if mentioned:
                target_scheme = mentioned[0]
            else:
                top_results = vector_engine.search(query, top_k=1)
                active_schemes = data_loader.get_all_schemes(include_inactive=False)
                target_scheme = top_results[0][0] if top_results else (active_schemes[0] if active_schemes else None)

            if not target_scheme:
                return ChatResponse(
                    query=query,
                    detected_language=lang,
                    intent=intent,
                    confidence=round(confidence, 2),
                    answer="No active schemes matched your query.",
                    audio_url=None,
                    matched_schemes=[],
                    eligibility_results=None,
                    suggested_actions=["Explore all citizen schemes"]
                )

            matched_schemes = [target_scheme]
            checklist_res = checklist_engine.generate_checklist(target_scheme.scheme_id, req.user_profile)
            doc_bullets = "\n".join([f"• {doc}" for doc in checklist_res.mandatory_documents])
            
            prefix = multilingual_engine.translate_intent_response(intent, {"scheme_name": target_scheme.short_name}, lang)
            portal_label = "ಅಧಿಕೃತ ಪೋರ್ಟಲ್" if lang == "kn" else "आधिकारिक पोर्टल" if lang == "hi" else "Official Portal"
            helpline_label = "ಸಹಾಯವಾಣಿ" if lang == "kn" else "हेल्पलाइन" if lang == "hi" else "Helpline"
            
            answer = f"{prefix}\n\n{doc_bullets}\n\n🔗 {portal_label}: {target_scheme.application_link}\n📞 {helpline_label}: {target_scheme.grievance_contact}"
            
            if lang == "kn":
                suggested_actions = [
                    f"ನಾನು {target_scheme.short_name} ಗೆ ಅರ್ಹನೇ?",
                    f"{target_scheme.short_name} ಇತರ ಯೋಜನೆಗಳೊಂದಿಗೆ ಹೋಲಿಸಿ",
                    "ಅರ್ಹತಾ ಪರಿಶೀಲಕವನ್ನು ತೆರೆಯಿರಿ"
                ]
            elif lang == "hi":
                suggested_actions = [
                    f"क्या मैं {target_scheme.short_name} के लिए पात्र हूं?",
                    f"{target_scheme.short_name} की अन्य योजनाओं से तुलना करें",
                    "पात्रता विज़ार्ड खोलें"
                ]
            else:
                suggested_actions = [
                    f"Am I eligible for {target_scheme.short_name}?",
                    f"Compare {target_scheme.short_name} with other schemes",
                    "Explore all citizen schemes"
                ]

        elif intent == "eligibility_check":
            mentioned = self.extract_mentioned_schemes(query)
            if mentioned:
                target_scheme = mentioned[0]
            else:
                top_results = vector_engine.search(query, top_k=1)
                active_schemes = data_loader.get_all_schemes(include_inactive=False)
                target_scheme = top_results[0][0] if top_results else (active_schemes[0] if active_schemes else None)

            if not target_scheme:
                return ChatResponse(
                    query=query,
                    detected_language=lang,
                    intent=intent,
                    confidence=round(confidence, 2),
                    answer="No active schemes matched your query to check eligibility.",
                    audio_url=None,
                    matched_schemes=[],
                    eligibility_results=None,
                    suggested_actions=["Explore all citizen schemes"]
                )

            matched_schemes = [target_scheme]
            
            profile = req.user_profile
            if not profile:
                profile = UserProfile(
                    age=35,
                    gender="Any",
                    state="Karnataka" if "karnataka" in query.lower() else "All-India",
                    occupation="Farmer" if "farmer" in query.lower() or "kisan" in target_scheme.short_name.lower() else "Self-Employed",
                    annual_income=150000,
                    owns_land=True if "farmer" in query.lower() or "kisan" in target_scheme.short_name.lower() else False,
                    landholding_acres=2.5,
                    caste_category="General"
                )

            res = eligibility_engine.evaluate_scheme(target_scheme, profile)
            eligibility_results = [res]
            
            status_text = res.eligibility_status
            if lang == "kn":
                if status_text == "Likely Eligible":
                    status_display = "ಅರ್ಹತೆಯ ಹೆಚ್ಚಿನ ಸಾಧ್ಯತೆ ಇದೆ (Likely Eligible)"
                elif status_text == "Conditionally Eligible":
                    status_display = "ಷರತ್ತುಬದ್ಧ ಅರ್ಹರು (Conditionally Eligible)"
                else:
                    status_display = "ಅರ್ಹರಲ್ಲ (Not Eligible)"
            elif lang == "hi":
                if status_text == "Likely Eligible":
                    status_display = "संभावित रूप से पात्र (Likely Eligible)"
                elif status_text == "Conditionally Eligible":
                    status_display = "शर्तों के साथ पात्र (Conditionally Eligible)"
                else:
                    status_display = "अपात्र (Not Eligible)"
            else:
                status_display = status_text

            reasons_summary = " ".join(res.reasons[:2])
            prefix = multilingual_engine.translate_intent_response(intent, {"scheme_name": target_scheme.short_name, "status": status_display}, lang)
            
            status_lbl = "ಸ್ಥಿತಿ" if lang == "kn" else "स्थिति" if lang == "hi" else "Status"
            conf_lbl = "ಖಚಿತತೆ" if lang == "kn" else "विश्वसनीयता" if lang == "hi" else "Confidence"
            crit_lbl = "ಮಾನದಂಡ ವಿಶ್ಲೇಷಣೆ" if lang == "kn" else "मानदंड विश्लेषण" if lang == "hi" else "Criteria Analysis"
            ben_lbl = "ಪ್ರಮುಖ ಪ್ರಯೋಜನ" if lang == "kn" else "प्रमुख लाभ" if lang == "hi" else "Key Benefit"
            att_lbl = "ಗಮನಿಸಿ" if lang == "kn" else "ध्यान दें" if lang == "hi" else "Attention"

            answer = f"{prefix}\n\n• {status_lbl}: {status_display} ({conf_lbl}: {int(res.confidence_score*100)}%)\n• {crit_lbl}: {reasons_summary}\n• {ben_lbl}: {target_scheme.key_benefits}"
            if res.missing_criteria:
                answer += f"\n• {att_lbl}: {res.missing_criteria[0]}"

            if lang == "kn":
                suggested_actions = [
                    f"{target_scheme.short_name} ಗೆ ಯಾವ ದಾಖಲೆಗಳು ಬೇಕು?",
                    "ಪೂರ್ಣ ಅರ್ಹತಾ ಪರಿಶೀಲಕವನ್ನು ತೆರೆಯಿರಿ",
                    f"{target_scheme.short_name} ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ"
                ]
            elif lang == "hi":
                suggested_actions = [
                    f"{target_scheme.short_name} के लिए आवश्यक दस्तावेज़?",
                    "पूर्ण पात्रता विज़ार्ड खोलें",
                    f"{target_scheme.short_name} के लिए ऑनलाइन आवेदन करें"
                ]
            else:
                suggested_actions = [
                    f"What documents for {target_scheme.short_name}?",
                    "Open full eligibility wizard",
                    f"Apply for {target_scheme.short_name} online"
                ]

        else: # scheme_search
            search_results = vector_engine.search(query, top_k=4)
            matched_schemes = [s for s, score in search_results]
            prefix = multilingual_engine.translate_intent_response(intent, {"count": len(matched_schemes)}, lang)
            
            scheme_bullets = "\n".join([
                f"• **{s.short_name}** ({s.ministry}): {s.key_benefits[:120]}..."
                for s in matched_schemes
            ])
            answer = f"{prefix}\n\n{scheme_bullets}"
            
            s_name = matched_schemes[0].short_name if matched_schemes else ""
            if lang == "kn":
                suggested_actions = [
                    f"ನಾನು {s_name} ಗೆ ಅರ್ಹನೇ?" if s_name else "ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ",
                    f"{s_name} ದಾಖಲೆಗಳ ಪಟ್ಟಿ" if s_name else "ದಾಖಲೆಗಳ ಪಟ್ಟಿ",
                    "ಯೋಜನೆಗಳ ಪಟ್ಟಿಯನ್ನು ಫಿಲ್ಟರ್ ಮಾಡಿ"
                ]
            elif lang == "hi":
                suggested_actions = [
                    f"क्या मैं {s_name} के लिए पात्र हूं?" if s_name else "पात्रता जांचें",
                    f"{s_name} के दस्तावेज़" if s_name else "दस्तावेज़ सूची",
                    "राज्य के अनुसार योजनाएं देखें"
                ]
            else:
                suggested_actions = [
                    f"Am I eligible for {s_name}?" if s_name else "Check eligibility",
                    f"Documents for {s_name}" if s_name else "Document checklist",
                    "Filter schemes by state"
                ]

        audio_url = voice_engine.generate_speech(answer, lang=lang)

        return ChatResponse(
            query=query,
            detected_language=lang,
            intent=intent,
            confidence=round(confidence, 2),
            answer=answer,
            audio_url=audio_url,
            matched_schemes=matched_schemes,
            eligibility_results=eligibility_results,
            suggested_actions=suggested_actions
        )

nlp_engine = NLPEngine()

