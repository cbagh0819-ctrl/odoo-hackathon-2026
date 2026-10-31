# Backend Service — Odoo Perfumes Engine
**Lead**: Deepak Dash (`deepak-codex08` — Backend & Database Engineer)

## Architecture Overview
This directory contains the core FastAPI application powering subscription lifecycles, automated billing generation, and finance metrics calculation:
- `app/models.py`: Database models mapped with SQLAlchemy.
- `app/routes/`: REST endpoints for subscriptions, invoices, payments, plans, and store operations.
- `app/services/billing.py`: The automated recurring billing engine with strict idempotency protection against duplicate invoice generation.
- `app/auth.py`: JWT-based authorization and persona access control.

## Running the Service
```bash
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive OpenAPI documentation: `http://localhost:8000/docs`.
