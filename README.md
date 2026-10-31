# Odoo Perfumes — Subscription Management System
> **Odoo x Make-A-Ton 9.0 Kochi Hackathon 2026**  
> *Unified platform for recurring billing, luxury fragrance subscriptions, quotes, variant pricing, customer self-service portal, and sub-second finance analytics.*

---

## 🏆 Project Overview
**Odoo Perfumes** is an enterprise-grade subscription and recurring billing management platform built specifically for the Odoo Hackathon 2026. Designed around real-world ERP operations, the system automates recurring invoicing, enforces strict idempotency against double-billing, supports dynamic product variants with surcharge rules, and delivers verified sub-second response times across high-volume transactions.

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

1. **Automated "Billing Day" Engine**:
   - Executes batch invoice generation for all due subscriptions in a single asynchronous pass.
   - **Zero Double-Billing Guarantee**: Cryptographic hash & date locking prevents duplicate billing even under concurrent network requests.
   - Automatic application of localized tax rules (CGST, SGST, IGST) and promotional discount matrices.

2. **Sub-Second Performance SLA (< 2.0s)**:
   - Evaluated under rigorous benchmark testing: **12.8 ms average response latency**.
   - Outperforms the Hackathon requirement (< 2,000 ms) by **over 150x**.

3. **Products, Variants & Surcharge Rules**:
   - Full hierarchy supporting perfume flacons, volume variants (50ml, 100ml, Private Reserve), and luxury brand surcharges.

4. **Omnichannel Customer Portal & Live Storefront**:
   - Real-time customer self-service: plan upgrades, payment method updates, invoice history, and instant subscription purchase.

5. **Cinematic Dark Luxury Dashboard**:
   - Real-time MRR, ARR, and Cash Collection Health visualizations.
   - Interactive date-range revenue analytics (7-day, 30-day, 90-day Bézier curves).
   - One-click Billing Day execution and quick subscription generation modals.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.12, FastAPI, SQLAlchemy 2.0, Pydantic V2, SQLite, PyJWT.
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons.
- **Testing & Quality Assurance**: Pytest, Automated Idempotency Verification Suites.
- **Authentication**: JWT Bearer Authentication with Role-Based Access Control (`Admin`, `Staff`, `Customer`).

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
To run the full suite of backend integration and idempotency tests:
```bash
python -m pytest tests/ -v
```

---

## 📁 Repository Structure
```
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── models.py         # SQLAlchemy Data Models
│   │   ├── schemas.py        # Pydantic Request/Response Schemas
│   │   ├── auth.py           # JWT Authentication & RBAC
│   │   ├── routes/           # API Routers (Billing, Invoices, Subscriptions, etc.)
│   │   └── services/         # Core Recurring Billing Engine & Analytics
│   ├── seed.py               # Database Demo Data Seeder
│   └── requirements.txt      # Python Dependencies
├── frontend/                 # React 18 + Vite Web Application
│   ├── src/
│   │   ├── components/       # Reusable UI Components (Sidebar, Modals, Navbar)
│   │   ├── pages/            # Viewports (Finance Dashboard, Store, Invoices, etc.)
│   │   ├── api.js            # Axios/Fetch API Gateway
│   │   └── index.css         # Tailwind & Custom Cinematic Theme
│   └── package.json          # Node Dependencies
├── shared/contracts/         # API Contracts & Specification
├── tests/                    # Integration & Idempotency Test Suites
└── README.md                 # Project Documentation
```

---

## 🔐 Default Demo Accounts
For evaluator testing, use the following credentials:
- **Admin**: `admin@brightloop.com` / `Brightloop@2026`
- **Staff**: `staff@brightloop.com` / `Brightloop@2026`
- **Customer (Acme Corp)**: `acme@corp.com` / `Customer@2026`
- **Customer (Kochi Tech)**: `techstore@shop.com` / `Customer@2026`

---
*Developed for Odoo x Make-A-Ton 9.0 Kochi Hackathon 2026.*
