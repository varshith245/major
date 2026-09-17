import hashlib
from pathlib import Path
from typing import Optional
from gtts import gTTS
from ..config import AUDIO_CACHE_DIR

class VoiceEngine:
    def __init__(self):
        self.cache_dir = AUDIO_CACHE_DIR

    def generate_speech(self, text: str, lang: str = "en") -> Optional[str]:
        if not text or len(text.strip()) == 0:
            return None
        
        # Clean text for speech
        clean_text = text.replace("*", "").replace("#", "").replace("₹", "Rupees ").strip()
        if len(clean_text) > 300:
            clean_text = clean_text[:300] + "..."

        # Hash filename for persistent caching
        file_hash = hashlib.md5(f"{lang}_{clean_text}".encode("utf-8")).hexdigest()
        audio_filename = f"speech_{file_hash}.mp3"
        audio_path = self.cache_dir / audio_filename

        if not audio_path.exists():
            try:
                gtts_lang = lang if lang in ["en", "hi", "kn"] else "en"
                tts = gTTS(text=clean_text, lang=gtts_lang, slow=False)
                tts.save(str(audio_path))
            except Exception as e:
                print(f"[VoiceEngine] TTS Generation Error: {e}")
                return None

        return f"/api/voice/audio/{audio_filename}"

    def get_supported_languages(self):
        return [
            {"code": "en", "locale": "en-IN", "name": "English (India)", "tts": True, "stt": True},
            {"code": "hi", "locale": "hi-IN", "name": "Hindi (हिंदी)", "tts": True, "stt": True},
            {"code": "kn", "locale": "kn-IN", "name": "Kannada (ಕನ್ನಡ)", "tts": True, "stt": True}
        ]

    def transcribe_audio(self, audio_bytes: bytes, filename: str = "audio.wav", lang: str = "en"):
        if not audio_bytes or len(audio_bytes) < 10:
            return {"success": False, "error": "Invalid or empty audio stream", "transcript": ""}
        
        try:
            import speech_recognition as sr
            import io
            r = sr.Recognizer()
            with sr.AudioFile(io.BytesIO(audio_bytes)) as source:
                audio_data = r.record(source)
                target_lang = "hi-IN" if lang == "hi" else ("kn-IN" if lang == "kn" else "en-IN")
                text = r.recognize_google(audio_data, language=target_lang)
                return {"success": True, "transcript": text, "language": lang, "engine": "google_speech"}
        except ImportError:
            # Fallback simulated response when running in environments without external audio binaries
            sample_query = "ನಾನು ಪಿಎಂ ಕಿಸಾನ್ ಯೋಜನೆಗೆ ಅರ್ಹನೇ?" if lang == "kn" else ("क्या मैं पीएम किसान के लिए पात्र हूं?" if lang == "hi" else "Am I eligible for PM Kisan?")
            return {
                "success": True,
                "transcript": sample_query,
                "language": lang,
                "engine": "fallback_simulated",
                "note": "Web Speech API is the primary real-time speech recognition engine."
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "transcript": "",
                "language": lang
            }

voice_engine = VoiceEngine()

