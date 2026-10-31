import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import (
    Subscription, SubscriptionLine, QuotationTemplate, QuotationTemplateLine,
    Plan, Product, ProductVariant, DiscountRule, User
)
from ..schemas import (
    SubscriptionCreate, SubscriptionOut, TemplateCreate, TemplateOut
)
from ..auth import get_current_user, require_role
from ..services.billing import advance_billing_date

router = APIRouter(prefix="/api/subscriptions", tags=["Quotations & Subscriptions"])

# --- Quotation Templates ---
@router.get("/templates", response_model=list[TemplateOut])
def list_templates(db: Session = Depends(get_db)):
    return db.query(QuotationTemplate).all()

@router.post("/templates", response_model=TemplateOut)
def create_template(
    tpl_in: TemplateCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(["admin", "staff"]))
):
    tpl = QuotationTemplate(
        name=tpl_in.name,
        validity_days=tpl_in.validity_days,
        plan_id=tpl_in.plan_id,
        notes=tpl_in.notes
    )
    db.add(tpl)
    db.flush()

    for line in tpl_in.lines:
        tpl_line = QuotationTemplateLine(
            template_id=tpl.id,
            product_id=line.product_id,
            variant_id=line.variant_id,
            quantity=line.quantity,
            unit_price=line.unit_price
        )
        db.add(tpl_line)

    db.commit()
    db.refresh(tpl)
    return tpl

# --- Subscriptions Pipeline ---
@router.get("", response_model=list[SubscriptionOut])
def list_subscriptions(
    status_filter: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Staff/Admin see all subscriptions.
    Customer portal users see ONLY their own subscriptions.
    """
    query = db.query(Subscription)
    if current_user.role == "customer":
        query = query.filter(Subscription.customer_id == current_user.id)
    
    if status_filter:
        query = query.filter(Subscription.status == status_filter)

    return query.order_by(Subscription.id.desc()).all()

@router.get("/{sub_id}", response_model=SubscriptionOut)
def get_subscription(
    sub_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sub = db.query(Subscription).filter(Subscription.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")

    if current_user.role == "customer" and sub.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return sub

@router.post("", response_model=SubscriptionOut)
def create_subscription(
    sub_in: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create subscription (starting in Draft or Quotation state).
    """
    customer_id = sub_in.customer_id
    if current_user.role == "customer":
        customer_id = current_user.id

    plan = db.query(Plan).filter(Plan.id == sub_in.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    # Generate unique subscription number: SUB-2026-0001
    count = db.query(Subscription).count() + 1
    sub_number = f"SUB-{datetime.datetime.utcnow().year}-{count:04d}"

    start_date = sub_in.start_date or datetime.datetime.utcnow()
    next_billing = start_date

    discount_id = None
    if sub_in.discount_code:
        disc = db.query(DiscountRule).filter(
            DiscountRule.code == sub_in.discount_code.upper(),
            DiscountRule.is_active == True
        ).first()
        if disc:
            discount_id = disc.id

    sub = Subscription(
        subscription_number=sub_number,
        customer_id=customer_id,
        plan_id=sub_in.plan_id,
        status="Draft",
        start_date=start_date,
        expiry_date=sub_in.expiry_date,
        next_billing_date=next_billing,
        payment_terms=sub_in.payment_terms,
        discount_rule_id=discount_id
    )
    db.add(sub)
    db.flush()

    for line in sub_in.lines:
        line_amount = line.quantity * line.unit_price
        sub_line = SubscriptionLine(
            subscription_id=sub.id,
            product_id=line.product_id,
            variant_id=line.variant_id,
            quantity=line.quantity,
            unit_price=line.unit_price,
            tax_rate=line.tax_rate,
            amount=line_amount
        )
        db.add(sub_line)

    db.commit()
    db.refresh(sub)
    return sub

@router.post("/{sub_id}/status")
def transition_status(
    sub_id: int,
    new_status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    State machine: Draft -> Quotation -> Confirmed -> Active -> Paused -> Closed
    """
    valid_statuses = ["Draft", "Quotation", "Confirmed", "Active", "Paused", "Closed"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    sub = db.query(Subscription).filter(Subscription.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")

    plan = sub.plan
    if new_status == "Paused" and plan and not plan.allow_pause:
        raise HTTPException(status_code=400, detail="This plan does not permit pausing.")

    if new_status == "Closed" and plan and not plan.allow_early_close:
        now = datetime.datetime.utcnow()
        if sub.expiry_date and now < sub.expiry_date:
            raise HTTPException(status_code=400, detail="This plan does not permit early closure.")

    sub.status = new_status
    db.commit()
    db.refresh(sub)
    return {"message": f"Subscription {sub.subscription_number} moved to {new_status}", "subscription": sub}
