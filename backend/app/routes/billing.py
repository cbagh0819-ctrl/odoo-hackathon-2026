import datetime
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Invoice, User, Subscription
from ..schemas import InvoiceOut
from ..auth import get_current_user, require_role
from ..services.billing import run_billing_day
from ..services.pdf_generator import generate_invoice_pdf

router = APIRouter(prefix="/api/billing", tags=["Billing & Invoices"])

@router.post("/run-billing-day")
def trigger_billing_day(
    target_date: str = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(["admin", "staff"]))
):
    """
    Executes 'Billing Day':
    Automatically creates invoices for due subscriptions without manual typing.
    Guarantees no double billing and automatic tax & discount application.
    """
    dt = datetime.datetime.fromisoformat(target_date) if target_date else datetime.datetime.utcnow()
    created = run_billing_day(db, target_date=dt)
    return {
        "status": "success",
        "message": f"Billing day completed. {len(created)} invoice(s) generated.",
        "invoices_generated": len(created)
    }

@router.get("/invoices", response_model=list[InvoiceOut])
def list_invoices(
    status_filter: str = None,
    overdue_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Invoice)
    if current_user.role == "customer":
        query = query.filter(Invoice.customer_id == current_user.id)

    if status_filter:
        query = query.filter(Invoice.status == status_filter)

    if overdue_only:
        now = datetime.datetime.utcnow()
        query = query.filter(Invoice.status != "Paid", Invoice.due_date < now)

    return query.order_by(Invoice.id.desc()).all()

@router.get("/invoices/{invoice_id}", response_model=InvoiceOut)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if current_user.role == "customer" and inv.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return inv

@router.post("/invoices/{invoice_id}/confirm")
def confirm_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(["admin", "staff"]))
):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    inv.status = "Confirmed"
    db.commit()
    return {"message": f"Invoice {inv.invoice_number} confirmed."}

@router.post("/invoices/{invoice_id}/cancel")
def cancel_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(["admin", "staff"]))
):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    inv.status = "Canceled"
    db.commit()
    return {"message": f"Invoice {inv.invoice_number} canceled."}

@router.get("/invoices/{invoice_id}/pdf")
@router.get("/invoices/{invoice_id}/print")
def download_invoice_pdf_endpoint(
    invoice_id: int,
    db: Session = Depends(get_db)
):
    """
    Generates and returns an authentic, downloadable binary PDF invoice file.
    Triggers native browser file download with proper Content-Disposition.
    """
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    pdf_bytes = generate_invoice_pdf(inv)
    filename = f"{inv.invoice_number or f'Invoice_{inv.id}'}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-cache",
            "Content-Type": "application/pdf",
            "X-Content-Type-Options": "nosniff"
        }
    )
