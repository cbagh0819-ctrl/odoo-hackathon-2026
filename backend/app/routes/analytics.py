import datetime
import time
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import Subscription, Invoice, Payment, User
from ..auth import require_role

router = APIRouter(prefix="/api/analytics", tags=["Finance & Analytics"])

@router.get("/finance-summary")
def get_finance_summary(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(["admin", "staff"]))
):
    """
    Per PDF:
    'The finance lead, at the end of the month:
     How many subscriptions are active?
     How much revenue came in, and how much is still owed?
     Which invoices are overdue?
     With thousands of subscriptions on the books, every page should still respond in under two seconds.'
    """
    start_time = time.time()
    now = datetime.datetime.utcnow()

    # 1. Active subscriptions count
    active_subs_count = db.query(Subscription).filter(Subscription.status == "Active").count()

    # 2. Total revenue collected (from payments)
    total_revenue_collected = db.query(func.coalesce(func.sum(Payment.amount), 0.0)).scalar()

    # 3. Total amount owed (Confirmed invoices not yet paid)
    unpaid_invoices = db.query(Invoice).filter(Invoice.status.in_(["Confirmed", "Draft"])).all()
    total_owed = 0.0
    for inv in unpaid_invoices:
        paid = sum(p.amount for p in inv.payments)
        total_owed += max(0.0, inv.total_amount - paid)

    # 4. Overdue invoices
    overdue_query = db.query(Invoice).filter(
        Invoice.status != "Paid",
        Invoice.status != "Canceled",
        Invoice.due_date < now
    )
    overdue_count = overdue_query.count()
    overdue_invoices = overdue_query.all()
    overdue_amount = sum(inv.total_amount - sum(p.amount for p in inv.payments) for inv in overdue_invoices)

    # 5. MRR Estimation (Monthly Recurring Revenue from active subscriptions)
    active_subs = db.query(Subscription).filter(Subscription.status == "Active").all()
    mrr = 0.0
    for sub in active_subs:
        plan = sub.plan
        sub_raw = sum(l.amount for l in sub.lines)
        if plan:
            freq = (plan.billing_frequency or "monthly").lower()
            if freq == "monthly":
                mrr += sub_raw
            elif freq == "yearly":
                mrr += sub_raw / 12.0
            elif freq == "weekly":
                mrr += sub_raw * 4.33
            elif freq == "daily":
                mrr += sub_raw * 30.0
        else:
            mrr += sub_raw

    elapsed_ms = round((time.time() - start_time) * 1000, 2)

    return {
        "status": "success",
        "benchmark_latency_ms": elapsed_ms,
        "under_two_seconds": elapsed_ms < 2000,
        "metrics": {
            "active_subscriptions": active_subs_count,
            "monthly_recurring_revenue_mrr": round(mrr, 2),
            "annual_run_rate_arr": round(mrr * 12.0, 2),
            "total_revenue_collected": round(total_revenue_collected, 2),
            "total_amount_owed": round(total_owed, 2),
            "overdue_invoices_count": overdue_count,
            "overdue_amount": round(overdue_amount, 2)
        }
    }
