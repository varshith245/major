# eGovSeva: Final-Year Project Demonstration & Evaluation Guide

This guide provides a comprehensive, end-to-end demonstration flow for evaluators, project guides, and examiners. It showcases all key modules of the **eGovSeva AI Public Service Assistant** in a logical, presentation-ready sequence.

---

## 1. System Architecture & Demo Setup

### Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: 18.0 or higher & **npm**: 9.0 or higher
- Modern web browser (Chrome, Edge, Firefox)

### Environment Configuration
Ensure `.env` exists in the project root with valid configuration (copy from `.env.example` if needed). Safe placeholder template:

| Environment Variable | Safe Placeholder / Default | Purpose |
| :--- | :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority` | Primary MongoDB Atlas connection (falls back to local SQLite/mock if unreachable) |
| `MONGODB_DB_NAME` | `egovseva_db` | Database name |
| `DATABASE_URL` | `sqlite:///backend/schemes_assistant.db` | Relational database fallback |
| `JWT_SECRET_KEY` | `change_this_to_a_secure_random_256_bit_secret_key_in_production` | Token signing secret |
| `JWT_ALGORITHM` | `HS256` | JWT signing algorithm |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` (7 days) | Access token lifespan |
| `SMTP_HOST` | `smtp-relay.brevo.com` | SMTP relay gateway (optional) |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USER` | `your_smtp_username` | SMTP username |
| `SMTP_PASSWORD` | `your_smtp_password` | SMTP password / API key |
| `SMTP_FROM_EMAIL` | `noreply@egovseva.gov.in` | Sender email address |
| `SMTP_FROM_NAME` | `"eGovSeva National Portal"` | Sender display name |
| `VITE_API_BASE_URL` | `""` (proxied via Vite) | Frontend API base URL |

> [!NOTE]
> **Simulated Email / Local OTP**: If external SMTP is not configured, the backend automatically prints all generated 6-digit OTP codes directly to the backend terminal (`[OTP SERVICE] >>> Generated OTP for ... <<<`), allowing complete local demo execution without third-party email dependencies.

---

## 2. Launching the Services

Open two terminal windows from the project root:

### Terminal 1: Backend Server (FastAPI)
```bash
# Activate virtual environment if configured:
# .\venv\Scripts\activate (Windows) or source venv/bin/activate (Linux/Mac)

python run_backend.py
```
- **Backend API**: `http://127.0.0.1:8000`
- **Interactive Swagger UI Documentation**: `http://127.0.0.1:8000/docs`
- **Health Check Endpoint**: `http://127.0.0.1:8000/api/health`

### Terminal 2: Frontend Client (React + Vite)
```bash
cd frontend
npm run dev
```
- **Citizen Portal**: `http://localhost:5173`

---

## 3. Step-by-Step Presentation & Evaluation Flow

### Pre-Seeded Accounts for Instant Demo
| Role | Email | Password | Intended Workflow |
| :--- | :--- | :--- | :--- |
| **Portal Administrator** | `admin@egovseva.gov.in` | `Admin@12345` | Administrative Portal, Application Review Queue, Audit Logs |
| **Citizen User** | `citizen@egovseva.gov.in` | `Citizen@12345` | Citizen Dashboard, Document Vault, Scheme Applications |

---

### Phase 1: Citizen Registration & Secure Authentication
**Goal**: Demonstrate secure sign-up, OTP verification, and JWT-authenticated session management.

1. Navigate to `http://localhost:5173`.
2. Click **Sign In** in the top navigation bar, then click **Create an Account** (or visit `http://localhost:5173/register`).
3. Fill in the citizen registration form:
   - **Full Name**: *e.g., Ananya Sharma*
   - **Email**: *e.g., ananya.citizen@demo.in*
   - **Mobile Number**: *e.g., 9876543210*
   - **State**: *Karnataka*
   - **Preferred Language**: *English / Hindi / Kannada*
4. Click **Send Verification Code**.
5. Retrieve the 6-digit OTP:
   - *If SMTP is configured*: Check your inbox.
   - *Local demo fallback*: View the OTP in Terminal 1 (`[OTP SERVICE] >>> Generated OTP for ... <<<`).
6. Enter the 6-digit code, click **Verify OTP**, set a password (e.g. `Citizen@12345`), and complete registration.
7. *Alternative Quick Sign-In*: Go to `http://localhost:5173/login` and sign in with `citizen@egovseva.gov.in` / `Citizen@12345`.

---

### Phase 2: Scheme Discovery, Multilingual NLP Assistant & Eligibility Wizard
**Goal**: Demonstrate AI-powered intent recognition, vector search, and rule-based eligibility evaluation.

1. **Scheme Explorer**:
   - Navigate to **Schemes** (`http://localhost:5173/schemes`).
   - Use search keywords (e.g., `farmer`, `health`, `scholarship`, `housing`).
   - Filter by categories: *Agriculture*, *Healthcare*, *Social Welfare*.
   - Toggle language from the navbar selector to test localized scheme metadata (**English**, **Hindi**, **Kannada**).
2. **AI Multilingual Conversational Assistant**:
   - Navigate to **AI Assistant** (`http://localhost:5173/assistant`).
   - Submit sample queries in multiple languages:
     - English: *"What benefits do small farmers get under PM-Kisan?"*
     - Hindi: *"आयुष्मान भारत योजना के क्या लाभ हैं?"*
     - Kannada: *"ರೈತರಿಗೆ ಸರ್ಕಾರದ ಯೋಜನೆಗಳು ಯಾವುವು?"*
   - Note the real-time intent extraction, scheme card recommendations, and integrated text-to-speech (TTS) audio response.
3. **Multi-Criteria Eligibility Wizard**:
   - Navigate to **Eligibility Checker** (`http://localhost:5173/eligibility`).
   - Enter profile demographics:
     - Age: `32`, Gender: `Female`, State: `Karnataka`
     - Occupation: `Farmer`, Annual Income: `120000`
     - Land Ownership: `Yes (2.0 acres)`, Category: `OBC`, BPL Card: `Yes`
   - Click **Check My Eligibility**.
   - Review `/eligibility/result` showing matched schemes, match percentage scores, and explicit rule explanations (e.g. *Income within ceiling*, *Landholding criteria satisfied*).

---

### Phase 3: Scheme Comparison & Application Submission
**Goal**: Demonstrate side-by-side scheme comparison, PDF comparison export, and application submission.

1. **Side-by-Side Scheme Comparison**:
   - Navigate to **Compare Schemes** (`http://localhost:5173/compare`).
   - Select multiple schemes (e.g., *PM Kisan Samman Nidhi* and *Pradhan Mantri Awas Yojana*).
   - Review the comparison matrix contrasting financial benefits, eligibility rules, and mandatory documents.
   - Click **Export Comparison (PDF)** to download the consolidated comparison report.
2. **Applying for a Scheme**:
   - Open any scheme's detail page (e.g., `http://localhost:5173/schemes/GOI-AGRI-001`).
   - Click **Apply Now** to open the Application & Tracking Modal.
   - Review the official department links and walk-in procedures.
   - Under **Citizen Application Tracker**, enter an acknowledgment reference (e.g. `PMK-2026-9182` or generate one) and click **Save to Tracker**.

---

### Phase 4: Citizen Document Vault & Application Acknowledgment PDF Slip
**Goal**: Demonstrate secure GridFS document storage, user-scoped authorization, and tamper-evident PDF export.

1. **Digital Document Locker & Vault**:
   - Navigate to **Documents** (`http://localhost:5173/documents`) and select the **Digital Vault** tab.
   - Click **Upload Document**.
   - Select document type: *Aadhaar Card* or *Income Certificate*.
   - Upload a sample PDF or image file (< 10MB).
   - Confirm the document appears in the citizen's secure vault with size, upload timestamp, and preview options.
2. **Application Tracker & PDF Acknowledgment Slip**:
   - Navigate to **My Applications** (`http://localhost:5173/applications`).
   - Locate the tracked application.
   - Click **Download Acknowledgment Slip (PDF)**.
   - Open the downloaded PDF and highlight:
     - Citizen Application Tracker header and Reference Number.
     - Scheme title, applicant name, and submission timestamp.
     - **Document-Integrity SHA-256 Hash**: Highlight the tamper-evident checksum computed over the application record (expressly designated as a document-integrity hash for tamper detection, not proof of sovereign government issuance or legal authentication).

---

### Phase 5: Administrative Review Queue, Status Transitions & Audit Logs
**Goal**: Demonstrate role-based access control (RBAC), nodal officer review queue, and audit trail generation.

1. **Sign in as Administrator**:
   - Log out of the citizen account, or open an Incognito window.
   - Navigate to `http://localhost:5173/login`.
   - Sign in using administrator credentials:
     - **Email**: `admin@egovseva.gov.in`
     - **Password**: `Admin@12345`
   - The user is automatically redirected to `/admin/dashboard`.
2. **Administrative Application Queue**:
   - In the Admin Sidebar, click **Citizen Applications** (`http://localhost:5173/admin/applications`).
   - Filter by status (`Submitted`, `Under Review`, `Approved`, `Rejected`) or search by citizen name / reference number.
   - Locate the newly submitted application from Phase 3/4 and click **Review**.
3. **Actioning an Official Decision**:
   - In the review modal, select the action type:
     - **Status Update**: Set status to `Under Review` or `Approved`.
     - Update the workflow stage (e.g. *Field Verification Completed*) and stage order (`3`).
     - Enter official administrative remarks (e.g. *Land records and Aadhaar verified by district nodal officer.*).
   - Click **Submit Official Update**.
   - Notice the application badge and timeline update immediately.
4. **Audit Trail Verification**:
   - Click **Audit Logs** in the admin sidebar (`http://localhost:5173/admin/audit-logs`).
   - Verify the immutable audit log entry recording:
     - Timestamp, Actor Email (`admin@egovseva.gov.in`), Action Type (`APPLICATION_STATUS_UPDATE`), Previous State, and New State.

---

### Phase 6: Multi-Channel Alerts & Citizen Notification Feedback Loop
**Goal**: Demonstrate event-triggered notification dispatch, real-time polling badge, and resilient delivery.

1. **Citizen Notification Experience**:
   - Return to the citizen account session (`http://localhost:5173`).
   - Notice the **Notification Bell** in the top navigation bar displays a red unread count badge.
   - Click the bell icon to expand the notification drawer.
   - Confirm the status change notification appears with:
     - Title: *Application Status Updated*
     - Details: Reflecting the admin's remarks and updated status (`Approved` / `Under Review`).
   - Click **Mark as Read** to clear the badge.
2. **Dashboard Lifecycle Reflection**:
   - Navigate to **Citizen Dashboard** (`http://localhost:5173/dashboard`) and **My Applications** (`http://localhost:5173/applications`).
   - Observe that the official decision is recorded and displayed with its milestone timeline.

---

## 4. Verification & Testing Commands

To demonstrate project test coverage and build stability to examiners:

### Backend Test Suite (Pytest)
```bash
python -m pytest -v
```
- **Total Tests**: 109 automated unit and integration tests.
- **Safety**: Fully isolated using `mongomock` in-memory client. Zero calls to production Atlas database.
- **Status**: 109 Passed, 0 Failed.

### Frontend Production Build
```bash
cd frontend
npm run build
```
- **Compiler**: TypeScript (`tsc`) and Vite production bundler.
- **Status**: Transformed 1500+ modules and generated optimized bundle in `frontend/dist`.

### Automated End-to-End Verification Script
```bash
python backend/verify_e2e_manual.py
```
- Validates user-scoped PDF downloading, cross-user denial (HTTP 404), comparison PDF export, document-integrity hashes, and notification failure resilience.

---

## 5. Technical Highlights for Project Presentation

1. **Hybrid Architecture**: Combines relational SQLite storage with document-oriented MongoDB Atlas, featuring automated fallback for uninterrupted operation.
2. **Zero-Leak RBAC Security**: Citizens can never escalate their privileges, change official statuses, or access another citizen’s vault documents or PDF slips.
3. **Tamper-Evident SHA-256 Checksums**: Every generated acknowledgment slip includes a cryptographic hash over the application record to ensure verifiable document integrity (without asserting sovereign government issuance).
4. **Resilient Notification Dispatch**: Notifications run with isolated error boundaries; transient dispatch issues never block administrative transactions.
5. **Trilingual Inclusivity**: Fully functional in English, Hindi, and Kannada, addressing diverse citizen demographics across India.
