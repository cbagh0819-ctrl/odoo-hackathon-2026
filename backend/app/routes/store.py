import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Product, ProductVariant, Plan, Subscription, SubscriptionLine, Invoice, InvoiceLine, Payment
from ..auth import hash_password
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/store", tags=["Cosmetics Public Storefront"])

class StoreOrderItem(BaseModel):
    name: str
    price: float
    quantity: int = 1
    item_type: str = "product"  # "product" or "subscription"
    notes: Optional[str] = None
    plan_freq: Optional[str] = "monthly"

class StoreOrderRequest(BaseModel):
    customer_name: str
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_address: Optional[str] = None
    customer_city: Optional[str] = None
    customer_pin: Optional[str] = None
    items: List[StoreOrderItem]
    subtotal: float
    discount_amount: float = 0.0
    tax_amount: float = 0.0
    total_amount: float
    payment_method: str = "UPI / Card"
    promo_code: Optional[str] = None

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

@router.post("/order")
def place_store_order(data: StoreOrderRequest, db: Session = Depends(get_db)):
    """
    General storefront order placement endpoint.
    Processes orders from the shopping website (single items, cart checkout, or VIP subscriptions).
    Generates customer, invoice, lines, payment, and subscription in real-time.
    """
    now = datetime.datetime.utcnow()

    # 1. Resolve or create customer
    email = data.customer_email
    if not email or "@" not in email:
        clean_name = "".join(c for c in data.customer_name if c.isalnum()).lower() or "customer"
        email = f"{clean_name}{int(now.timestamp()) % 10000}@perfumestore.in"

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            name=data.customer_name,
            email=email,
            password_hash=hash_password("Customer@2026"),
            role="customer"
        )
        db.add(user)
        db.flush()

    # 2. Check for subscription items & create subscription if present
    sub = None
    sub_items = [it for it in data.items if it.item_type == "subscription"]
    if sub_items:
        first_sub_item = sub_items[0]
        freq = (first_sub_item.plan_freq or "monthly").lower()
        plan = db.query(Plan).filter(Plan.billing_frequency == freq).first()
        if not plan:
            plan = db.query(Plan).first()
            if not plan:
                plan = Plan(name=f"{first_sub_item.name} Plan", cost=first_sub_item.price, billing_frequency=freq)
                db.add(plan)
                db.flush()

        if freq == "weekly":
            next_bill = now + datetime.timedelta(weeks=1)
        elif freq == "annual" or freq == "yearly":
            next_bill = now + datetime.timedelta(days=365)
        elif freq == "quarterly":
            next_bill = now + datetime.timedelta(days=90)
        else:
            next_bill = now + datetime.timedelta(days=30)

        sub_count = db.query(Subscription).count() + 1
        sub_number = f"SUB-{now.year}-{sub_count:04d}"

        sub = Subscription(
            subscription_number=sub_number,
            customer_id=user.id,
            plan_id=plan.id,
            status="Active",
            start_date=now,
            next_billing_date=next_bill,
            payment_terms="Immediate (Online)"
        )
        db.add(sub)
        db.flush()

        for s_it in sub_items:
            first_product = db.query(Product).first()
            prod_id = first_product.id if first_product else 1
            db.add(SubscriptionLine(
                subscription_id=sub.id,
                product_id=prod_id,
                variant_id=None,
                quantity=s_it.quantity,
                unit_price=s_it.price,
                tax_rate=18.0,
                amount=s_it.price * s_it.quantity
            ))

    if not sub:
        plan = db.query(Plan).first()
        if not plan:
            plan = Plan(name="Standard Perfume Plan", cost=data.total_amount, billing_frequency="monthly")
            db.add(plan)
            db.flush()

        sub_count = db.query(Subscription).count() + 1
        sub_number = f"SUB-{now.year}-{sub_count:04d}"
        next_bill = now + datetime.timedelta(days=30)

        sub = Subscription(
            subscription_number=sub_number,
            customer_id=user.id,
            plan_id=plan.id,
            status="Active",
            start_date=now,
            next_billing_date=next_bill,
            payment_terms="Immediate (Online)"
        )
        db.add(sub)
        db.flush()

        first_product = db.query(Product).first()
        prod_id = first_product.id if first_product else 1
        for it in data.items:
            db.add(SubscriptionLine(
                subscription_id=sub.id,
                product_id=prod_id,
                variant_id=None,
                quantity=it.quantity,
                unit_price=it.price,
                tax_rate=18.0,
                amount=it.price * it.quantity
            ))

    # 3. Create Invoice & Lines
    inv_count = db.query(Invoice).count() + 1
    inv_number = f"INV-2026-{inv_count:04d}"

    inv_lines = []
    for it in data.items:
        line_tax = round((it.price * it.quantity) * 0.18, 2)
        line_total = round((it.price * it.quantity) + line_tax, 2)
        inv_lines.append(
            InvoiceLine(
                product_name=it.name,
                variant_name=it.notes or ("VIP Subscription" if it.item_type == "subscription" else "100ml Eau de Parfum"),
                quantity=it.quantity,
                unit_price=it.price,
                tax_rate=18.0,
                total_amount=line_total
            )
        )

    invoice = Invoice(
        invoice_number=inv_number,
        subscription_id=sub.id,
        customer_id=user.id,
        issue_date=now,
        due_date=now,
        status="Paid",
        subtotal=round(data.subtotal, 2),
        tax_amount=round(data.tax_amount, 2),
        discount_amount=round(data.discount_amount, 2),
        total_amount=round(data.total_amount, 2),
        lines=inv_lines
    )
    db.add(invoice)
    db.flush()

    # 4. Record Payment
    payment = Payment(
        invoice_id=invoice.id,
        amount=round(data.total_amount, 2),
        payment_method=data.payment_method,
        payment_date=now,
        note=f"Storefront Order: {', '.join(it.name for it in data.items)}",
        reference_code=f"PAY-STR-{int(now.timestamp())}"
    )
    db.add(payment)
    db.commit()

    # 5. Broadcast event to live event feed
    items_desc = ", ".join(f"{it.name} (x{it.quantity})" for it in data.items)
    event = {
        "id": invoice.id,
        "invoice_number": inv_number,
        "subscription_number": sub.subscription_number if sub else None,
        "customer_name": user.name,
        "items_summary": items_desc,
        "amount": round(data.total_amount, 2),
        "is_subscription": sub is not None,
        "timestamp": now.isoformat()
    }
    recent_purchases.insert(0, event)
    if len(recent_purchases) > 20:
        recent_purchases.pop()

    return {
        "status": "success",
        "message": f"Order received for {items_desc}!",
        "invoice_number": inv_number,
        "subscription_number": sub.subscription_number if sub else None,
        "total_paid": round(data.total_amount, 2),
        "customer": user.name
    }

@router.post("/reset-dashboard-zero")
def reset_dashboard_zero(db: Session = Depends(get_db)):
    """
    Clears all subscriptions, invoices, and payments so the dashboard starts fresh at ₹0 / 0 subscriptions.
    """
    db.query(Payment).delete()
    db.query(InvoiceLine).delete()
    db.query(Invoice).delete()
    db.query(SubscriptionLine).delete()
    db.query(Subscription).delete()
    db.commit()
    recent_purchases.clear()
    return {
        "status": "success",
        "message": "Dashboard reset to zero successfully.",
        "metrics": {
            "active_subscriptions": 0,
            "total_revenue_collected": 0.0,
            "monthly_recurring_revenue_mrr": 0.0,
            "total_amount_owed": 0.0,
            "overdue_invoices_count": 0
        }
    }

@router.post("/checkout")
def public_checkout(data: StoreCheckoutRequest, db: Session = Depends(get_db)):
    """
    Legacy 1-click subscription checkout.
    """
    now = datetime.datetime.utcnow()
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

    plan = db.query(Plan).filter(Plan.billing_frequency == data.plan_frequency.lower()).first()
    if not plan:
        plan = db.query(Plan).first()

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

    event = {
        "id": sub.id,
        "invoice_number": inv_number,
        "customer_name": user.name,
        "items_summary": f"{product.name} (x{data.quantity})",
        "amount": total_amount,
        "is_subscription": True,
        "timestamp": now.isoformat()
    }
    recent_purchases.insert(0, event)
    if len(recent_purchases) > 20:
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
