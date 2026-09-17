import re
from typing import Dict, Any, Optional
from .data_loader import data_loader

class MultilingualEngine:
    def __init__(self):
        self.kannada_regex = re.compile(r"[\u0C80-\u0CFF]")
        self.hindi_regex = re.compile(r"[\u0900-\u097F]")
        self.dict_data = data_loader.multilingual

    def detect_language(self, text: str) -> str:
        if not text:
            return "en"
        if self.kannada_regex.search(text):
            return "kn"
        elif self.hindi_regex.search(text):
            return "hi"
        return "en"

    def get_ui_text(self, key: str, lang: str = "en") -> str:
        translations = self.dict_data.get("translations", {})
        if key in translations:
            return translations[key].get(lang, translations[key].get("en", key))
        return key

    def translate_intent_response(self, intent: str, context: Dict[str, Any], lang: str = "en") -> str:
        if lang == "hi":
            if intent == "greeting":
                return "नमस्ते! मैं आपका एआई सरकारी योजना सहायक हूं। आप मुझसे योजनाओं की खोज, पात्रता जांच, या आवश्यक दस्तावेजों के बारे में पूछ सकते हैं।"
            elif intent == "scheme_search":
                count = context.get("count", 0)
                return f"आपके प्रश्न के आधार पर हमें {count} प्रासंगिक सरकारी कल्याणकारी योजनाएं मिली हैं:"
            elif intent == "eligibility_check":
                status = context.get("status", "")
                name = context.get("scheme_name", "")
                return f"'{name}' के लिए आपकी पात्रता की स्थिति: {status}।"
            elif intent == "document_query":
                name = context.get("scheme_name", "")
                return f"'{name}' के लिए आवश्यक दस्तावेजों की सूची नीचे दी गई है:"
            elif intent == "comparison":
                return "चयनित सरकारी योजनाओं की विस्तृत तुलना तालिका नीचे प्रस्तुत है:"
            return "सरकारी योजनाओं के बारे में अपनी आवश्यकता बताएं।"

        elif lang == "kn":
            if intent == "greeting":
                return "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಸಹಾಯಕ. ನೀವು ಯೋಜನೆಗಳ ಹುಡುಕಾಟ, ಅರ್ಹತೆ ಪರಿಶೀಲನೆ ಅಥವಾ ಅಗತ್ಯ ದಾಖಲೆಗಳ ಬಗ್ಗೆ ಕೇಳಬಹುದು."
            elif intent == "scheme_search":
                count = context.get("count", 0)
                return f"ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಅನುಗುಣವಾಗಿ {count} ಸೂಕ್ತ ಸರ್ಕಾರಿ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು ಲಭ್ಯವಿವೆ:"
            elif intent == "eligibility_check":
                status = context.get("status", "")
                name = context.get("scheme_name", "")
                return f"'{name}' ಗಾಗಿ ನಿಮ್ಮ ಅರ್ಹತೆಯ ಫಲಿತಾಂಶ: {status}."
            elif intent == "document_query":
                name = context.get("scheme_name", "")
                return f"'{name}' ಯೋಜನೆಗೆ ಅಗತ್ಯವಿರುವ ಕಡ್ಡಾಯ ದಾಖಲೆಗಳ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ:"
            elif intent == "comparison":
                return "ಆಯ್ಕೆಮಾಡಿದ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ವಿವರವಾದ ಹೋಲಿಕೆ ಇಲ್ಲಿದೆ:"
            return "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಕುರಿತು ನಿಮ್ಮ ಅಗತ್ಯವನ್ನು ತಿಳಿಸಿ."

        else: # English
            if intent == "greeting":
                return "Hello! I am your AI Public Service Assistant for Government Schemes. How can I assist you with scheme discovery, eligibility assessment, or document checklists today?"
            elif intent == "scheme_search":
                count = context.get("count", 0)
                return f"I found {count} relevant government welfare schemes matching your criteria:"
            elif intent == "eligibility_check":
                status = context.get("status", "")
                name = context.get("scheme_name", "")
                return f"Eligibility assessment for '{name}': {status}."
            elif intent == "document_query":
                name = context.get("scheme_name", "")
                return f"Here is the official document checklist for '{name}':"
            elif intent == "comparison":
                return "Here is the comprehensive side-by-side comparison of the selected schemes:"
            return "Please let me know how I can help you with government welfare schemes."

multilingual_engine = MultilingualEngine()
