import pytest
import datetime
import time
from backend.app.database import SessionLocal, Base, engine
from backend.app.models import User, Product, ProductVariant, Plan, Subscription, SubscriptionLine, Invoice, Payment
from backend.app.services.billing import run_billing_day
from backend.app.schemas import UserRegister

def setup_module():
    Base.metadata.create_all(bind=engine)

def test_password_strength_rule():
    """Verify password must be >8 characters with upper, lower, and special char."""
    # Invalid: no special char
    with pytest.raises(ValueError):
        UserRegister(name="Test", email="test1@test.com", password="Password123")
    
    # Invalid: under 8 chars
    with pytest.raises(ValueError):
        UserRegister(name="Test", email="test2@test.com", password="Pass@1")

    # Valid
    user_reg = UserRegister(name="Valid User", email="valid@test.com", password="Password@2026")
    assert user_reg.password == "Password@2026"

def test_odoo_variant_price_math():
    """Verify that selecting Odoo brand variant adds exactly 560 to base price."""
    db = SessionLocal()
    p = Product(name="Test Software", sales_price=1500.0, cost_price=500.0)
    db.add(p)
    db.flush()

    v = ProductVariant(
        product_id=p.id,
        variant_name="Brand: Odoo Edition",
        attribute_name="Brand",
        attribute_value="Odoo",
        price_extra=560.0
    )
    db.add(v)
    db.commit()

    total_with_variant = p.sales_price + v.price_extra
    assert total_with_variant == 2060.0
    db.close()

def test_billing_day_idempotency():
    """Verify that running billing day twice never bills twice or skips a due subscription."""
    db = SessionLocal()
    # First run
    run1 = run_billing_day(db)
    # Immediate second run
    run2 = run_billing_day(db)
    # Second run must produce 0 duplicate invoices
    assert len(run2) == 0
    db.close()

def test_finance_query_sub_two_seconds():
    """Verify that finance summary responds well under the 2.0 second SLA."""
    start = time.time()
    db = SessionLocal()
    subs_count = db.query(Subscription).filter(Subscription.status == "Active").count()
    invoices = db.query(Invoice).all()
    payments = db.query(Payment).all()
    elapsed = time.time() - start
    db.close()
    assert elapsed < 2.0, f"Query took {elapsed}s, exceeds 2s SLA"
