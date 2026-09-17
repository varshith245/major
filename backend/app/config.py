import os
from pathlib import Path
from dotenv import load_dotenv

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = BASE_DIR / "backend"
DATA_DIR = BASE_DIR / "data"

# Load .env file from workspace root
ENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH)

# Dataset paths
SCHEMES_DATASET_PATH = DATA_DIR / "schemes_dataset.json"
SCHEMES_CSV_PATH = DATA_DIR / "schemes_dataset.csv"
ELIGIBILITY_RULES_PATH = DATA_DIR / "eligibility_rules.json"
NLP_INTENT_PATH = DATA_DIR / "nlp_intent_dataset.json"
MULTILINGUAL_PATH = DATA_DIR / "multilingual_phrases.json"

# Audio cache directory
AUDIO_CACHE_DIR = BACKEND_DIR / "audio_cache"
AUDIO_CACHE_DIR.mkdir(parents=True, exist_ok=True)

# Database URL (SQLite default with support for PostgreSQL)
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BACKEND_DIR}/schemes_assistant.db")

# MongoDB Atlas Configuration
MONGODB_URI = os.getenv("MONGODB_URI", "")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "egovseva_db")
MONGODB_ENABLED = bool(MONGODB_URI)

# JWT Authentication & BCrypt Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "egovseva_secure_jwt_secret_key_super_256bit_production_ready_token_key_2026")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))  # 7 Days default



