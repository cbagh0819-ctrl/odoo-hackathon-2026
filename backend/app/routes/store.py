import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Product, ProductVariant, Plan, Subscription, SubscriptionLine, Invoice, InvoiceLine, Payment
from ..auth import hash_password
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/store", tags=["Cosmetics Public Storefront"])

class StoreCheckoutRequest(BaseModel):
    customer_name: str
    customer_email: str
    product_id: int
    variant_id: Optional[int] = None
    plan_frequency: str = "monthly"  # weekly, monthly, yearly
    quantity: int = 1
    add_on_ids: Optional[List[int]] = []
    payment_method: str = "UPI / Card"

# In-memory recent purchase events for real-time notification broadcast
recent_purchases = []

@router.post("/checkout")
def public_checkout(data: StoreCheckoutRequest, db: Session = Depends(get_db)):
    """
    Public 1-click subscription checkout for Odoo Cosmetics.
    Creates customer, activates subscription, generates invoice, and updates MRR in real time.
    """
    now = datetime.datetime.utcnow()

    # 1. Find or create customer
    user = db.query(User).filter(User.email == data.customer_email).first()
    if not user:
        user = User(
            name=data.customer_name,
            email=data.customer_email,
            password_hash=hash_password("Customer@2026"),
            role="customer"
        )
        db.add(user)
        db.flush()

    # 2. Find matching plan by frequency
    plan = db.query(Plan).filter(Plan.billing_frequency == data.plan_frequency.lower()).first()
    if not plan:
        plan = db.query(Plan).first()

    # 3. Main Product & Variant calculation
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    unit_price = product.sales_price
    variant_name = None
    if data.variant_id:
        variant = db.query(ProductVariant).filter(ProductVariant.id == data.variant_id).first()
        if variant:
            unit_price += variant.price_extra
            variant_name = variant.variant_name

    # 4. Create Active Subscription
    sub_count = db.query(Subscription).count() + 1
    sub_number = f"SUB-COSMETIC-{now.year}-{sub_count:04d}"

    if data.plan_frequency == "weekly":
        next_billing = now + datetime.timedelta(weeks=1)
    elif data.plan_frequency == "yearly":
        next_billing = now + datetime.timedelta(days=365)
    else:
        next_billing = now + datetime.timedelta(days=30)

    sub = Subscription(
        subscription_number=sub_number,
        customer_id=user.id,
        plan_id=plan.id if plan else 1,
        status="Active",
        start_date=now,
        next_billing_date=next_billing,
        payment_terms="Immediate (Paid Online)"
    )
    db.add(sub)
    db.flush()

    # Subscription Line
    sub_line = SubscriptionLine(
        subscription_id=sub.id,
        product_id=product.id,
        variant_id=data.variant_id,
        quantity=data.quantity,
        unit_price=unit_price,
        tax_rate=18.0,
        amount=unit_price * data.quantity
    )
    db.add(sub_line)
    db.flush()

    # Add-on lines
    subtotal = unit_price * data.quantity
    inv_lines = [
        InvoiceLine(
            product_name=product.name,
            variant_name=variant_name,
            quantity=data.quantity,
            unit_price=unit_price,
            tax_rate=18.0,
            total_amount=round((unit_price * data.quantity) * 1.18, 2)
        )
    ]

    for addon_id in data.add_on_ids or []:
        addon = db.query(Product).filter(Product.id == addon_id).first()
        if addon:
            subtotal += addon.sales_price
            db.add(SubscriptionLine(
                subscription_id=sub.id,
                product_id=addon.id,
                quantity=1,
                unit_price=addon.sales_price,
                tax_rate=18.0,
                amount=addon.sales_price
            ))
            inv_lines.append(InvoiceLine(
                product_name=addon.name,
                variant_name="Add-on Refill",
                quantity=1,
                unit_price=addon.sales_price,
                tax_rate=18.0,
                total_amount=round(addon.sales_price * 1.18, 2)
            ))

    # 5. Create Invoice & Instant Payment
    tax_amount = round(subtotal * 0.18, 2)
    total_amount = round(subtotal + tax_amount, 2)
    inv_number = f"INV-COSMETIC-{now.year}-{sub.id:04d}-001"

    invoice = Invoice(
        invoice_number=inv_number,
        subscription_id=sub.id,
        customer_id=user.id,
        issue_date=now,
        due_date=now,
        status="Paid",
        subtotal=round(subtotal, 2),
        tax_amount=tax_amount,
        discount_amount=0.0,
        total_amount=total_amount,
        lines=inv_lines
    )
    db.add(invoice)
    db.flush()

    # Record Payment
    payment = Payment(
        invoice_id=invoice.id,
        amount=total_amount,
        payment_method=data.payment_method,
        payment_date=now,
        note=f"Instant Storefront Checkout - {product.name}",
        reference_code=f"PAY-CSMT-{int(now.timestamp())}"
    )
    db.add(payment)
    db.commit()

    # Event for real-time toaster
    event = {
        "id": sub.id,
        "customer_name": user.name,
        "product_name": product.name,
        "variant": variant_name,
        "amount": total_amount,
        "timestamp": now.isoformat()
    }
    recent_purchases.insert(0, event)
    if len(recent_purchases) > 10:
        recent_purchases.pop()

    return {
        "status": "success",
        "message": f"Successfully subscribed to {product.name}!",
        "subscription_number": sub_number,
        "invoice_number": inv_number,
        "total_paid": total_amount,
        "customer": user.name
    }

@router.get("/recent-events")
def get_recent_events():
    return recent_purchases
