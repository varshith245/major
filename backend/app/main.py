from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from .config import MONGODB_ENABLED, MONGODB_DB_NAME
from .database.seeder import init_db_and_seed
from .database.mongodb import mongodb_manager
from .services.data_loader import data_loader
from .routes import schemes, chat, eligibility, checklist, comparison, voice, documents, stats, auth, admin, dashboard, applications, notifications

# Ensure database tables and initial data are seeded on import
try:
    init_db_and_seed()
except Exception as init_err:
    print(f"[Main] Notice during database init: {init_err}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    print("[Application Lifecycle] Initializing Database & Knowledge Engine...")
    init_db_and_seed()
    print(f"[Application Lifecycle] Loaded {len(data_loader.get_all_schemes())} schemes successfully.")
    print(f"[Application Lifecycle] MongoDB Atlas Database: {'CONNECTED (' + MONGODB_DB_NAME + ')' if mongodb_manager.is_connected else 'CONNECTING'}")
    yield
    # Shutdown logic
    print("[Application Lifecycle] Shutting down application gracefully.")

app = FastAPI(
    title="AI Public Service Assistant for Government Schemes (API)",
    description="Enterprise-grade e-Governance AI Backend featuring NLP Question Answering, Hybrid Eligibility Engine, MongoDB Atlas Cloud Database, Trilingual Translation & Vector Search",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]
)

# Include API Routers
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(schemes.router)
app.include_router(chat.router)
app.include_router(eligibility.router)
app.include_router(checklist.router)
app.include_router(comparison.router)
app.include_router(voice.router)
app.include_router(documents.router)
app.include_router(stats.router)
app.include_router(dashboard.router)
app.include_router(applications.router)
app.include_router(notifications.router)


@app.get("/")
def root_status():
    return {
        "status": "online",
        "service": "AI Public Service Assistant API",
        "version": "1.0.0",
        "total_schemes_loaded": len(data_loader.get_all_schemes()),
        "database_provider": "MongoDB Atlas",
        "mongodb_connected": mongodb_manager.is_connected,
        "database_name": MONGODB_DB_NAME,
        "supported_languages": ["English (en)", "Hindi (hi)", "Kannada (kn)"],
        "api_documentation": "/docs",
        "openapi_spec": "/openapi.json"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "schemes_count": len(data_loader.get_all_schemes()),
        "rules_count": len(data_loader.eligibility_rules),
        "mongodb_active": mongodb_manager.is_connected,
        "database": "MongoDB Atlas"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)

