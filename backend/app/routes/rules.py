from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import TaxRule, DiscountRule, User
from ..schemas import TaxRuleCreate, TaxRuleOut, DiscountRuleCreate, DiscountRuleOut
from ..auth import require_role

router = APIRouter(prefix="/api/rules", tags=["Taxes & Discounts"])

# --- Tax Rules (Admin Only) ---
@router.get("/taxes", response_model=list[TaxRuleOut])
def list_tax_rules(db: Session = Depends(get_db)):
    return db.query(TaxRule).all()

@router.post("/taxes", response_model=TaxRuleOut)
def create_tax_rule(
    tax_in: TaxRuleCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["admin"]))
):
    if tax_in.is_default:
        db.query(TaxRule).update({TaxRule.is_default: False})
        db.flush()

    tax = TaxRule(
        name=tax_in.name,
        rate_percent=tax_in.rate_percent,
        is_default=tax_in.is_default
    )
    db.add(tax)
    db.commit()
    db.refresh(tax)
    return tax

# --- Discount Rules (Admin Only Per PDF) ---
@router.get("/discounts", response_model=list[DiscountRuleOut])
def list_discount_rules(db: Session = Depends(get_db)):
    return db.query(DiscountRule).all()

@router.post("/discounts", response_model=DiscountRuleOut)
def create_discount_rule(
    disc_in: DiscountRuleCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["admin"]))
):
    """Per PDF: Only the admin can create discount rules."""
    existing = db.query(DiscountRule).filter(DiscountRule.code == disc_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Discount code already exists")

    discount = DiscountRule(
        code=disc_in.code.upper(),
        name=disc_in.name,
        discount_type=disc_in.discount_type,
        value=disc_in.value,
        min_purchase=disc_in.min_purchase,
        min_quantity=disc_in.min_quantity,
        start_date=disc_in.start_date,
        end_date=disc_in.end_date,
        max_usage=disc_in.max_usage,
        applies_to_product_id=disc_in.applies_to_product_id,
        is_active=disc_in.is_active
    )
    db.add(discount)
    db.commit()
    db.refresh(discount)
    return discount
