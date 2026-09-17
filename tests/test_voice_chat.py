import pytest
import io
from fastapi.testclient import TestClient
from backend.app.main import app

def _get_client():
    return TestClient(app)

def test_chat_payload_with_query():
    client = _get_client()
    res = client.post("/api/chat", json={"query": "Am I eligible for PM Kisan?", "language": "en"})
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert data["intent"] in ["eligibility_check", "scheme_search"]
    assert len(data["answer"]) > 0

def test_chat_payload_with_message():
    """Verifies that sending 'message' instead of 'query' resolves seamlessly without 422."""
    client = _get_client()
    res = client.post("/api/chat", json={"message": "Am I eligible for PM Kisan?", "language": "en"})
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert len(data["answer"]) > 0

def test_chat_payload_empty_validation():
    """Verifies that an empty chat body fails validation with 422."""
    client = _get_client()
    res = client.post("/api/chat", json={})
    assert res.status_code == 422

def test_chat_multilingual_kannada():
    client = _get_client()
    res = client.post("/api/chat", json={"query": "ನಾನು ಪಿಎಂ ಕಿಸಾನ್ ಯೋಜನೆಗೆ ಅರ್ಹನೇ?", "language": "kn"})
    assert res.status_code == 200
    data = res.json()
    assert data["detected_language"] == "kn"
    assert len(data["suggested_actions"]) > 0

def test_chat_multilingual_hindi():
    client = _get_client()
    res = client.post("/api/chat", json={"query": "क्या मैं पीएम किसान के लिए पात्र हूं?", "language": "hi"})
    assert res.status_code == 200
    data = res.json()
    assert data["detected_language"] == "hi"
    assert len(data["suggested_actions"]) > 0

def test_voice_status_endpoint():
    client = _get_client()
    res = client.get("/api/voice/status")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "active"
    codes = [item["code"] for item in data["supported_languages"]]
    assert "en" in codes
    assert "hi" in codes
    assert "kn" in codes

def test_voice_synthesize_english():
    client = _get_client()
    res = client.get("/api/voice/synthesize", params={"text": "Hello citizen welcome to Seva assistant", "lang": "en"})
    assert res.status_code == 200
    data = res.json()
    assert "audio_url" in data
    assert data["audio_url"].startswith("/api/voice/audio/")

def test_voice_synthesize_hindi():
    client = _get_client()
    res = client.get("/api/voice/synthesize", params={"text": "नमस्ते नागरिक, सेवा में आपका स्वागत है", "lang": "hi"})
    assert res.status_code == 200
    data = res.json()
    assert "audio_url" in data
    assert data["audio_url"].startswith("/api/voice/audio/")

def test_voice_synthesize_kannada():
    client = _get_client()
    res = client.get("/api/voice/synthesize", params={"text": "ನಮಸ್ಕಾರ ನಾಗರಿಕರೇ, ಸೇವಾ ಸಹಾಯಕಕ್ಕೆ ಸುಸ್ವಾಗತ", "lang": "kn"})
    assert res.status_code == 200
    data = res.json()
    assert "audio_url" in data
    assert data["audio_url"].startswith("/api/voice/audio/")

def test_voice_audio_streaming():
    client = _get_client()
    synth_res = client.get("/api/voice/synthesize", params={"text": "Test audio streaming file", "lang": "en"})
    assert synth_res.status_code == 200
    audio_url = synth_res.json()["audio_url"]
    
    # Now stream the audio file
    stream_res = client.get(audio_url)
    assert stream_res.status_code == 200
    assert stream_res.headers["content-type"] == "audio/mpeg"
    assert len(stream_res.content) > 100

def test_voice_audio_not_found():
    client = _get_client()
    res = client.get("/api/voice/audio/nonexistent_audio_file_9999.mp3")
    assert res.status_code == 404

def test_voice_transcribe_fallback():
    client = _get_client()
    fake_audio = io.BytesIO(b"RIFFdummywavheaderandbytesforunittestrecording12345")
    files = {"file": ("test_voice.wav", fake_audio, "audio/wav")}
    res = client.post("/api/voice/transcribe?lang=en", files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "transcript" in data
    assert len(data["transcript"]) > 0

def test_voice_transcribe_empty_file():
    client = _get_client()
    empty_audio = io.BytesIO(b"")
    files = {"file": ("empty.wav", empty_audio, "audio/wav")}
    res = client.post("/api/voice/transcribe?lang=en", files=files)
    assert res.status_code == 400
