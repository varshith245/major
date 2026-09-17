from pathlib import Path
from fastapi import APIRouter, HTTPException, Query, UploadFile, File
from fastapi.responses import FileResponse
from ..services.voice_engine import voice_engine
from ..config import AUDIO_CACHE_DIR

router = APIRouter(prefix="/api/voice", tags=["Voice Engine"])

@router.get("/status")
def get_voice_status():
    languages = voice_engine.get_supported_languages()
    return {
        "status": "active",
        "supported_languages": languages,
        "default_locale": "en-IN",
        "primary_stt": "Web Speech API (Browser)",
        "fallback_stt": "Server Transcribe"
    }

@router.get("/audio/{filename}")
def get_audio_file(filename: str):
    file_path = AUDIO_CACHE_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(file_path, media_type="audio/mpeg")

@router.get("/synthesize")
def synthesize_speech(text: str = Query(..., min_length=1), lang: str = "en"):
    url = voice_engine.generate_speech(text, lang=lang)
    if not url:
        raise HTTPException(status_code=500, detail="Failed to synthesize speech")
    return {"audio_url": url}

@router.post("/transcribe")
async def transcribe_speech(
    file: UploadFile = File(...),
    lang: str = Query("en", description="Target language code (en, hi, kn)")
):
    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Uploaded audio file is empty")
        result = voice_engine.transcribe_audio(content, filename=file.filename or "audio.wav", lang=lang)
        if not result.get("success"):
            raise HTTPException(status_code=422, detail=result.get("error", "Transcription failed"))
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription error: {str(e)}")

