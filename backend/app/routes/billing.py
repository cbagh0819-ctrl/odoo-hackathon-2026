import datetime
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Invoice, User, Subscription
from ..schemas import InvoiceOut
from ..auth import get_current_user, require_role
from ..services.billing import run_billing_day

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

@router.get("/invoices/{invoice_id}/print")
def print_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if current_user.role == "customer" and inv.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Render a clean, official Odoo-styled HTML invoice printable template
    customer_name = inv.customer.name if inv.customer else "Customer"
    customer_email = inv.customer.email if inv.customer else ""

    lines_html = "".join([
        f"""<tr>
            <td style="padding:10px; border-bottom:1px solid #ddd;">{line.product_name} {f'({line.variant_name})' if line.variant_name else ''}</td>
            <td style="padding:10px; border-bottom:1px solid #ddd; text-align:center;">{line.quantity}</td>
            <td style="padding:10px; border-bottom:1px solid #ddd; text-align:right;">₹{line.unit_price:.2f}</td>
            <td style="padding:10px; border-bottom:1px solid #ddd; text-align:right;">{line.tax_rate}%</td>
            <td style="padding:10px; border-bottom:1px solid #ddd; text-align:right;">₹{line.total_amount:.2f}</td>
        </tr>"""
        for line in inv.lines
    ])

    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {inv.invoice_number} - Brightloop Software</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #222; }}
        .header {{ display: flex; justify-content: space-between; border-bottom: 2px solid #714B67; padding-bottom: 20px; }}
        .brand {{ font-size: 24px; font-weight: bold; color: #714B67; }}
        .meta {{ margin-top: 20px; display: flex; justify-content: space-between; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 30px; }}
        th {{ background-color: #f7f7f7; padding: 10px; border-bottom: 2px solid #ddd; text-align: left; }}
        .totals {{ margin-top: 20px; float: right; width: 300px; }}
        .totals-row {{ display: flex; justify-content: space-between; padding: 6px 0; }}
        .grand-total {{ font-size: 18px; font-weight: bold; border-top: 2px solid #714B67; padding-top: 10px; color: #714B67; }}
        .badge {{ padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; }}
        .paid {{ background-color: #d1fae5; color: #065f46; }}
        .draft {{ background-color: #f3f4f6; color: #374151; }}
        .confirmed {{ background-color: #dbeafe; color: #1e40af; }}
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="brand">Brightloop Software</div>
            <div>Subscription & Recurring Billing</div>
        </div>
        <div style="text-align:right;">
            <h2>INVOICE</h2>
            <div><strong>{inv.invoice_number}</strong></div>
            <div>Status: <span class="badge {inv.status.lower()}">{inv.status}</span></div>
        </div>
    </div>

    <div class="meta">
        <div>
            <strong>Billed To:</strong><br>
            {customer_name}<br>
            {customer_email}
        </div>
        <div style="text-align:right;">
            <strong>Issue Date:</strong> {inv.issue_date.strftime("%Y-%m-%d")}<br>
            <strong>Due Date:</strong> {inv.due_date.strftime("%Y-%m-%d")}
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th style="text-align:center;">Qty</th>
                <th style="text-align:right;">Unit Price</th>
                <th style="text-align:right;">Tax Rate</th>
                <th style="text-align:right;">Amount</th>
            </tr>
        </thead>
        <tbody>
            {lines_html}
        </tbody>
    </table>

    <div class="totals">
        <div class="totals-row"><span>Subtotal:</span><span>₹{inv.subtotal:.2f}</span></div>
        <div class="totals-row"><span>Taxes:</span><span>₹{inv.tax_amount:.2f}</span></div>
        <div class="totals-row"><span>Discounts:</span><span>-₹{inv.discount_amount:.2f}</span></div>
        <div class="totals-row grand-total"><span>Total Due:</span><span>₹{inv.total_amount:.2f}</span></div>
    </div>
</body>
</html>"""
    return Response(content=html_content, media_type="text/html")
