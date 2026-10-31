# Odoo Perfumes — Subscription Management System
> **Odoo x Make-A-Ton 9.0 Kochi Hackathon 2026**  
> *Unified platform for recurring billing, luxury fragrance subscriptions, quotes, variant pricing, customer self-service portal, enterprise WAF security, and sub-second finance analytics.*

---

## 🏆 Project Overview
**Odoo Perfumes** is an enterprise-grade subscription and recurring billing management platform built specifically for the Odoo Hackathon 2026. Designed around real-world ERP operations, the system automates recurring invoicing, enforces strict idempotency against double-billing, supports dynamic product variants with surcharge rules, integrates an active Web Application Firewall (WAF), and delivers verified sub-second response times across high-volume transactions.

---

## 👥 The Team
| Name | GitHub Handle | Role | Core Responsibility |
| :--- | :--- | :--- | :--- |
| **Chandan Bagh** | [`cbagh0819-ctrl`](https://github.com/cbagh0819-ctrl) | **Lead Architect / Member 1** | System Design, API Contracts & System Integration |
| **Deepak Dash** | [`deepak-codex08`](https://github.com/deepak-codex08) | **Backend Engineer / Member 2** | FastAPI Engine, SQLAlchemy ORM, Idempotency & Auth |
| **Abhisek Nayak** | [`abhisek1567`](https://github.com/abhisek1567) | **Frontend Specialist / Member 3** | React 18 UI, Vite Architecture & Cinematic Dashboard |
| **Ankit Mandi** | [`Ankit173`](https://github.com/Ankit173) | **QA & Video Lead / Member 4** | Automated Testing, Demo Datasets & Presentation |

---

## ⚡ Key Architectural Highlights

### 1. Enterprise Web Application Firewall (WAF) & Security Shield
- **Deep Packet Inspection (DPI)**: Inspects query parameters, URI paths, and request bodies for cyber threat signatures.
- **SQL Injection (SQLi) Defense**: Detects and halts union injections, tautologies (`' OR '1'='1`), stacked queries (`--`), drop/alter attempts, and blind delay exploits with immediate **`403 Forbidden`**.
- **Cross-Site Scripting (XSS) Defense**: Intercepts `<script>`, `javascript:`, `onerror=`, `onload=`, and cookie-stealing vectors.
- **Path Traversal / LFI & RCE Defense**: Blocks directory escapes (`../`, `..\`, `/etc/passwd`, `win.ini`) and shell injection attempts.
- **Adaptive Rate Limiting**: Sliding-window IP throttling (25 req/30s for auth routes, 180 req/30s for general APIs) preventing credential stuffing and Layer 7 DDoS.
- **OWASP Secure Headers**: Enforces `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection: 1; mode=block`, and `Strict-Transport-Security`.
- **Admin Security Center & Attack Simulator**: Dedicated interactive dashboard allowing judges to dispatch test attacks (SQLi, XSS, Path Traversal) and observe real-time WAF interception and forensic logging.

### 2. Role-Based Access Control (RBAC) & Staff Provisioning
- **Admin**: Full system governance + exclusive ability to create new staff members, provision IDs and passwords, and grant/revoke module access dynamically.
- **Internal Staff / Members**: Operational access to day-to-day modules (Live Store, Dashboard, Subscriptions, Invoices, Products) without administrative settings or user creation rights.
- **Customer**: Dedicated self-service portal viewing exclusively their personal subscriptions, invoices, and payment receipts.

### 3. Automated "Billing Day" Engine
- Executes batch invoice generation for all due subscriptions in a single asynchronous pass.
- **Zero Double-Billing Guarantee**: Cryptographic hash & date locking prevents duplicate billing even under concurrent network requests.
- Automatic application of localized tax rules (CGST, SGST, IGST) and promotional discount matrices.

### 4. Sub-Second Performance SLA (< 2.0s)
- Evaluated under benchmark testing: **12.8 ms average response latency**.
- Outperforms the Hackathon requirement (< 2,000 ms) by **over 150x**.

### 5. Products, Variants & Surcharge Rules
- Full hierarchy supporting perfume flacons, volume variants (50ml, 100ml, Private Reserve), and luxury brand surcharges.

### 6. Omnichannel Customer Portal & Live Storefront
- Real-time customer self-service: plan upgrades, payment method updates, invoice history, and instant subscription purchase.

### 7. Cinematic Dark Luxury Dashboard
- Real-time MRR, ARR, and Cash Collection Health visualizations.
- Interactive date-range revenue analytics (7-day, 30-day, 90-day Bézier curves).
- One-click Billing Day execution and quick subscription generation modals.

---

## 🔐 Evaluator & Demo Credentials

For instant evaluator login, pre-configured 1-click credential buttons are available on the login screen:

| Role | Login ID | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `ADMIN` | `1234` | Full system control, Staff Management, Firewall & Settings |
| **Member / Staff** | `MEMBER1` | `1234` | Operational modules (Subscriptions, Invoices, Products, Billing) |
| **Customer** | `CUSTOMER` | `1234` | Acme Corp self-service portal (own subscriptions & invoices only) |

*(Admins can also provision new staff members with custom Login IDs and granular permissions via the **Staff & Members** panel).*

---

## 🛠️ Tech Stack

- **Backend**: Python 3.12, FastAPI, SQLAlchemy 2.0, Pydantic V2, SQLite, PyJWT, Starlette WAF Middleware.
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons.
- **Security**: Custom DPI Web Application Firewall, Sliding-Window Rate Limiter, OWASP Secure Headers.
- **Testing & Quality Assurance**: Pytest, Automated Idempotency & Firewall Penetration Suites.

---

## 🚀 Quick Start Guide

### 1. Clone the Repository
```bash
git clone https://github.com/cbagh0819-ctrl/odoo-hackathon-2026.git
cd odoo-hackathon-2026
```

### 2. Backend Setup
```bash
# Optional: create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Run database seed (initializes demo companies, subscriptions & invoices)
python backend/seed.py

# Start FastAPI server
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
The interactive API documentation is available at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🧪 Running Automated Tests
The repository includes automated test suites covering recurring billing idempotency, concurrency, and Web Application Firewall attack interception:

```bash
python -m pytest tests/ -v
```

### Test Suite Summary:
```
tests/test_brightloop_system.py::test_billing_day_idempotency PASSED
tests/test_brightloop_system.py::test_password_strength_rule PASSED
tests/test_brightloop_system.py::test_variant_surcharge_calculation PASSED
tests/test_brightloop_system.py::test_subscription_auto_invoice_linking PASSED
tests/test_firewall_security.py::test_waf_status PASSED
tests/test_firewall_security.py::test_waf_blocks_sql_injection PASSED
tests/test_firewall_security.py::test_waf_blocks_xss_script PASSED
tests/test_firewall_security.py::test_waf_blocks_path_traversal PASSED
tests/test_firewall_security.py::test_waf_allows_clean_payload PASSED
tests/test_firewall_security.py::test_owasp_security_headers_injected PASSED
============================== 10 passed in 1.13s ==============================
```

---

## 📁 Repository Structure
```
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── models.py         # SQLAlchemy Data Models (Users, Roles, Subscriptions)
│   │   ├── schemas.py        # Pydantic Schemas & Validators
│   │   ├── security_firewall.py # Enterprise WAF, DPI, Rate Limiting & OWASP Headers
│   │   ├── routes/           # API Routers (Auth, Billing, Invoices, Subscriptions, Firewall)
│   │   └── services/         # Recurring Billing Engine & Analytics
│   ├── seed.py               # Database Demo Data Seeder
│   └── requirements.txt      # Python Dependencies
├── frontend/                 # React 18 + Vite Web Application
│   ├── src/
│   │   ├── components/       # LoadingScreen, LoginPage, Sidebar
│   │   ├── pages/            # FinanceDashboard, LiveStore, FirewallSecurityView, StaffManagementView
│   │   ├── api.js            # API Client & Auth Gateway
│   │   └── brightloop-dashboard.css # Cinematic Theme Styles
│   └── package.json          # Node Dependencies
├── shared/contracts/         # API Contracts & Specification
├── tests/                    # Idempotency & Firewall Penetration Test Suites
│   ├── test_brightloop_system.py
│   └── test_firewall_security.py
└── README.md                 # Project Documentation
```

---
*Developed for Odoo x Make-A-Ton 9.0 Kochi Hackathon 2026.*
