import pytest
from backend.app.services.nlp_engine import nlp_engine
from backend.app.services.vector_engine import vector_engine
from backend.app.services.multilingual_engine import multilingual_engine
from backend.app.models.schemas import ChatRequest

def test_intent_classification():
    intents = [
        ("Am I eligible for PM Kisan?", "eligibility_check"),
        ("What documents are needed for Ayushman card?", "document_query"),
        ("Compare PMAY Gramin vs Urban", "comparison"),
        ("Hello, how can you help?", "greeting"),
        ("Find schemes for street vendors in Karnataka", "scheme_search")
    ]
    for query, expected_intent in intents:
        intent, confidence = nlp_engine.classify_intent(query)
        assert intent == expected_intent, f"Query '{query}' classified as {intent}, expected {expected_intent}"
        assert confidence > 0.70

def test_language_detection():
    assert multilingual_engine.detect_language("Hello assistant") == "en"
    assert multilingual_engine.detect_language("ನಾನು ಪ್ರಧಾನ ಮಂತ್ರಿ ಕಿಸಾನ್ ಯೋಜನೆಗೆ ಅರ್ಹನೇ?") == "kn"
    assert multilingual_engine.detect_language("आयुष्मान भारत कार्ड के लिए आवश्यक दस्तावेज") == "hi"

def test_vector_search():
    results = vector_engine.search("farmer crop insurance subsidy", top_k=3)
    assert len(results) >= 1
    scheme_names = [s.short_name for s, score in results]
    assert any(name in ["PMFBY", "PM-KISAN", "KCC"] for name in scheme_names)

def test_chat_pipeline():
    req = ChatRequest(query="Am I eligible for PM Kisan?")
    res = nlp_engine.process_chat(req)
    assert res.intent == "eligibility_check"
    assert len(res.answer) > 20
    assert len(res.matched_schemes) >= 1
