# eGovSeva - AI Public Service Assistant for Government Schemes

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.110-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python)](https://python.org)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas%20%2F%20SQLite-47A248?logo=mongodb)](https://www.mongodb.com/)

**eGovSeva** is an enterprise-grade, citizen-centric e-Governance platform designed to bridge the awareness and accessibility gap for Central and State government welfare schemes in India. It combines a trilingual conversational AI assistant, hybrid eligibility evaluation engine, citizen digital document vault, full lifecycle application tracking, multi-channel alert engine, and printable PDF export utilities.

---

## Key Features

### 1. Trilingual Conversational AI & NLP Assistant
- **Multilingual Support**: Real-time interactions in English (`en`), Hindi (`hi`), and Kannada (`kn`).
- **Hybrid Semantic Search**: Combines rule-based intent recognition with TF-IDF vector similarity and cosine matching across official welfare scheme databases.
- **Voice Synthesis**: Integrated text-to-speech (gTTS) audio responses for accessibility across diverse citizen demographics.

### 2. Multi-Criteria Eligibility Engine
- **Deterministic & Fuzzy Evaluation**: Evaluates citizens against income slabs, landholding limits, age brackets, occupation, social category, and geographic criteria.
- **Explainable Decisions**: Transparent breakdowns explaining *why* a citizen qualifies or which specific criteria remain unmet.

### 3. Citizen Digital Document Vault
- **GridFS & Secure Storage**: Securely store certificates, identity cards, and income proofs with backend file type validation and size limits (10MB max).
- **Strict User Scoping**: Document ownership is enforced on every operation (upload, listing, preview, deletion). Cross-citizen access is strictly denied.
- **Application Integration**: Citizens can seamlessly attach stored vault documents to scheme applications without re-uploading.

### 4. Application Tracker & Nodal Officer Review Portal
- **Lifecycle Tracking**: Citizens track application progress through stages (`Submitted`, `Under Review`, `Approved`, `Rejected`) with full timeline logs.
- **Admin Review Queue**: Authorized nodal officers and administrators filter applications, verify submitted documents, record official remarks, and update statuses.
- **Audit Logging**: Every administrative action and status update is logged with timestamps, actor IDs, and previous/new states.

### 5. Multi-Channel Notification Dispatcher
- **In-App Alerts**: Real-time notification bell with unread counters and live polling updates.
- **Event-Driven Triggers**: Dispatches alerts automatically upon status transitions, document requests, and sanction notices.
- **Fault-Tolerant Architecture**: Notification delivery failures are handled safely and isolated, ensuring application status updates never fail due to notification dispatch errors.

### 6. Printable Scheme Comparison & Acknowledgment PDF Export
- **Printable Application Acknowledgment**: Clean, high-resolution PDF generation with citizen details, scheme metadata, submission timestamp, and current tracking status.
- **Document-Integrity SHA-256 Hash**: Each acknowledgment generates a tamper-evident SHA-256 digest over the application record (explicitly labeled as a document-integrity hash, not proof of government authenticity).
- **Side-by-Side Scheme Comparison PDF**: Export comparative evaluations of multiple welfare schemes across benefits, eligibility, and documents.

---

## Technology Stack

- **Backend**:
  - **Framework**: FastAPI (Python 3.10+) with Uvicorn ASGI server
  - **Databases**: MongoDB Atlas (via Motor & PyMongo) with automated SQLite fallback
  - **Security**: JWT (PyJWT HS256), BCrypt password hashing
  - **Document Generation**: ReportLab 4.0+
  - **Machine Learning & NLP**: scikit-learn (TF-IDF vectorizer), NumPy, gTTS
- **Frontend**:
  - **Framework**: React 18 with Vite build system
  - **Language**: TypeScript 5
  - **Routing**: React Router DOM v7
  - **Icons & UI**: Lucide-React, custom TailwindCSS design system

---

## Repository Structure

```
├── backend/
│   ├── app/
│   │   ├── config.py              # Centralized environment configuration
│   │   ├── main.py                # FastAPI app initialization and route registration
│   │   ├── database/              # MongoDB Atlas connection & SQLite fallback
│   │   ├── models/                # Pydantic schemas and database models
│   │   ├── routes/                # API endpoints (auth, admin, applications, schemes, etc.)
│   │   └── services/              # Core business logic (AI, eligibility, PDF, vault, email)
│   ├── requirements.txt           # Production Python dependencies
│   ├── requirements-dev.txt       # Development and testing dependencies
│   └── verify_e2e_manual.py       # End-to-end automated verification script
├── data/
│   ├── schemes_dataset.json       # Master catalog of government schemes
│   ├── eligibility_rules.json     # Rule definitions for scheme qualification
│   └── multilingual_phrases.json  # Trilingual dictionary (EN, HI, KN)
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable UI components (AppShell, modals, etc.)
│   │   ├── pages/                 # Route views (Dashboard, Vault, Admin, Tracker, etc.)
│   │   ├── services/              # Client-side API services
│   │   └── context/               # Auth, Accessibility, and Toast contexts
│   ├── package.json               # Node.js dependencies and scripts
│   └── vite.config.ts             # Vite configuration with API reverse proxy
├── tests/                         # Pytest test suite (109+ tests covering all modules)
├── .env.example                   # Sanitized configuration template
├── .gitignore                     # Git exclusion rules for secrets, caches, and builds
├── pytest.ini                     # Pytest configuration
├── run_backend.py                 # Backend launcher script
└── run_backend.bat                # Windows quick-start batch script
```

---

## Prerequisites

- **Python**: Version `3.10` or higher
- **Node.js**: Version `18.0.0` or higher (LTS recommended)
- **npm**: Version `9.0.0` or higher
- **Git**: (Optional, for version control)

---

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "major project"
```

### 2. Configure Environment Variables
Create a local `.env` configuration by copying `.env.example`:
```bash
# On Linux/macOS
cp .env.example .env

# On Windows (PowerShell)
Copy-Item .env.example .env
```
Open `.env` and adjust settings as required. For local development, default values will run using local SQLite and mock email delivery:
- `MONGODB_URI`: Leave empty for offline/SQLite mode, or supply a MongoDB Atlas connection string.
- `JWT_SECRET_KEY`: Set a secure 256-bit secret key.
- `SMTP_*`: Supply SMTP credentials (e.g., Brevo) if real email OTP delivery is desired.

### 3. Backend Setup
Create and activate a Python virtual environment:
```bash
# On Windows
python -m venv venv
.\venv\Scripts\activate

# On Linux/macOS
python3 -m venv venv
source venv/bin/activate
```

Install backend dependencies:
```bash
pip install -r backend/requirements.txt -r backend/requirements-dev.txt
```

### 4. Frontend Setup
Navigate to the `frontend` directory and install dependencies:
```bash
cd frontend
npm install
cd ..
```

---

## Running the Application

### Starting the Backend Server
From the project root:
```bash
python run_backend.py
```
*Or using Uvicorn directly:*
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
- **Backend API**: `http://127.0.0.1:8000`
- **Interactive Swagger UI**: `http://127.0.0.1:8000/docs`
- **Health Check**: `http://127.0.0.1:8000/api/health`

### Starting the Frontend Development Server
From the `frontend` directory:
```bash
cd frontend
npm run dev
```
- **Citizen Portal Web UI**: `http://localhost:5173`
- *Note: Vite automatically proxies all `/api` calls to the local FastAPI backend on port 8000.*

---

## Running Tests & Quality Verification

### 1. Backend Test Suite (Pytest)
Run the full backend test suite covering authorization, eligibility, document vault, PDF generation, and notifications:
```bash
python -m pytest -v
```
To run specific test modules:
```bash
# Application tracker and status permissions
pytest tests/test_application_tracker.py -v

# Document vault user-scoping and GridFS tests
pytest tests/test_document_vault.py -v

# PDF acknowledgment and comparison export tests
pytest tests/test_pdf_export.py -v

# Multi-channel notification dispatcher tests
pytest tests/test_notifications.py -v
```

### 2. Frontend Production Build Check
Verify TypeScript types and frontend bundling:
```bash
cd frontend
npm run build
```

### 3. Automated End-to-End Verification Script
Run the comprehensive verification script to validate user-scoping, PDF generation integrity, and notification resilience:
```bash
python backend/verify_e2e_manual.py
```

---

## Default Demo Accounts

For demonstration and testing purposes, the system includes pre-seeded accounts:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@egovseva.gov.in` | `Admin@12345` | Full admin portal (`/admin/*`), review applications, audit logs |
| **Citizen User** | `citizen@egovseva.gov.in` | `Citizen@12345` | Citizen portal, scheme applications, document vault, tracker |

> **Note on OTP & Local Demo**: When running locally without live SMTP credentials configured in `.env`, generated 6-digit OTPs are printed directly to the backend terminal console (`[OTP SERVICE] >>> Generated OTP for ... <<<`) for seamless local registration and login.
>
> **Note on Test Database Safety**: The test suite uses `mongomock` in-memory database isolation (`tests/conftest.py`). Pytest never connects to or modifies any external/production database.

---

## Security & Architecture Highlights

1. **Strict User Scoping**: Every citizen resource (applications, uploaded vault documents, in-app notifications, and generated PDF acknowledgments) verifies authenticated user ownership (`current_user["user_id"] == resource["user_id"]`). Cross-user access returns HTTP 403 / 404.
2. **Role-Based Status Mutability**: Ordinary citizens cannot update application statuses to official decisions (`Approved`, `Rejected`, `Under Review`). Only authorized administrators or system nodal officers can update statuses.
3. **Tamper-Evident SHA-256 Hashes**: Acknowledgment PDFs include a cryptographic checksum computed over the record data, clearly designated as a document-integrity hash rather than sovereign legal proof.
4. **Resilient Notification Dispatch**: Status transitions execute inside isolated try-except blocks so that secondary notification delivery errors do not block primary state changes.
