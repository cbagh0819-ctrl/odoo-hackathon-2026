from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routes import auth, products, plans, rules, subscriptions, billing, payments, analytics, store

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Odoo Perfumes - Subscription Management System",
    description="Unified software platform to run perfume subscriptions, recurring billing, and luxury plans. Built for Odoo Hackathon 2026.",
    version="1.0.0"
)

# Enable CORS for local Vite React development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(plans.router)
app.include_router(rules.router)
app.include_router(subscriptions.router)
app.include_router(billing.router)
app.include_router(payments.router)
app.include_router(analytics.router)
app.include_router(store.router)

@app.get("/")
def root():
    return {
        "system": "Odoo Perfumes Subscription Management Platform",
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/health")
def healthcheck():
    return {"status": "healthy"}
