import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Invoice, Payment, User
from ..schemas import PaymentCreate, PaymentOut
from ..auth import get_current_user, require_role

router = APIRouter(prefix="/api/payments", tags=["Payments"])

@router.post("/invoices/{invoice_id}", response_model=PaymentOut)
def record_payment(
    invoice_id: int,
    payment_in: PaymentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(["admin", "staff"]))
):
    """
    Per PDF: 'Payments arrive by different methods and on different days.
    Each one needs to be recorded with its method, amount, date and a note, against the right invoice.'
    """
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if inv.status == "Canceled":
        raise HTTPException(status_code=400, detail="Cannot record payments on a canceled invoice")

    payment = Payment(
        invoice_id=inv.id,
        amount=payment_in.amount,
        payment_method=payment_in.payment_method,
        payment_date=datetime.datetime.utcnow(),
        note=payment_in.note,
        reference_code=payment_in.reference_code
    )
    db.add(payment)
    db.flush()

    # Calculate total paid
    total_paid = sum(p.amount for p in inv.payments)
    if total_paid >= inv.total_amount:
        inv.status = "Paid"

    db.commit()
    db.refresh(payment)
    return payment

@router.get("", response_model=list[PaymentOut])
def list_payments(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(["admin", "staff"]))
):
    return db.query(Payment).order_by(Payment.id.desc()).all()
