import time
from fastapi import APIRouter
from ..models.schemas import ChatRequest, ChatResponse
from ..services.nlp_engine import nlp_engine
from ..database.connection import SessionLocal
from ..database.models import ChatHistoryDB

router = APIRouter(prefix="/api/chat", tags=["Chat Assistant"])

@router.post("", response_model=ChatResponse)
def handle_chat_message(req: ChatRequest):
    start_time = time.time()
    response = nlp_engine.process_chat(req)
    latency = int((time.time() - start_time) * 1000)

    # Persist in ChatHistoryDB for real administrative AI query analytics
    try:
        db = SessionLocal()
        query_status = "Success" if response.matched_schemes else ("Low Confidence" if response.intent == "scheme_search" else "Success")
        entry = ChatHistoryDB(
            session_id=req.session_id or "SES-WEB",
            user_query=req.query,
            detected_language=response.detected_language or "en",
            intent=response.intent or "scheme_search",
            confidence=0.92,
            assistant_response=response.answer[:500],
            audio_url=response.audio_url,
            latency_ms=latency,
            status=query_status
        )
        db.add(entry)
        db.commit()
        db.close()
    except Exception as e:
        print(f"[ChatRoute] Failed to log chat query to DB: {e}")

    return response
