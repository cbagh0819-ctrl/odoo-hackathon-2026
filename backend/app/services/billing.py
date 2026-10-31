import datetime
from sqlalchemy.orm import Session
from ..models import Subscription, Invoice, InvoiceLine, DiscountRule, TaxRule, Plan

def advance_billing_date(current_date: datetime.datetime, frequency: str) -> datetime.datetime:
    freq = (frequency or "monthly").lower()
    if freq == "daily":
        return current_date + datetime.timedelta(days=1)
    elif freq == "weekly":
        return current_date + datetime.timedelta(weeks=1)
    elif freq == "yearly":
        try:
            return current_date.replace(year=current_date.year + 1)
        except ValueError:
            return current_date + datetime.timedelta(days=365)
    else:  # monthly default
        # Add roughly 1 month
        month = current_date.month + 1
        year = current_date.year
        if month > 12:
            month = 1
            year += 1
        day = min(current_date.day, 28)
        return current_date.replace(year=year, month=month, day=day)

def run_billing_day(db: Session, target_date: datetime.datetime = None):
    """
    Executes automated recurring billing for all Active subscriptions due on or before target_date.
    Guarantees idempotency: checks that an invoice hasn't already been generated for this cycle.
    Calculates tax rules and automatically applies active discounts.
    """
    now = target_date or datetime.datetime.utcnow()
    
    # 1. Fetch active subscriptions due for billing
    active_subscriptions = db.query(Subscription).filter(
        Subscription.status == "Active",
        Subscription.next_billing_date <= now
    ).all()

    invoices_created = []

    # Get default tax rule if set
    default_tax_rule = db.query(TaxRule).filter(TaxRule.is_default == True).first()
    default_tax_rate = default_tax_rule.rate_percent if default_tax_rule else 18.0

    for sub in active_subscriptions:
        # Check plan termination rule
        plan = sub.plan
        if sub.expiry_date and now >= sub.expiry_date:
            if plan and plan.auto_close_on_end:
                sub.status = "Closed"
                db.commit()
                continue

        # Prevent double-billing:
        # Check if an invoice was already issued for this exact next_billing_date cycle
        cycle_start = sub.next_billing_date - datetime.timedelta(days=1)
        cycle_end = sub.next_billing_date + datetime.timedelta(days=1)
        existing_invoice = db.query(Invoice).filter(
            Invoice.subscription_id == sub.id,
            Invoice.issue_date >= cycle_start,
            Invoice.issue_date <= cycle_end
        ).first()

        if existing_invoice:
            # Already billed for this period! Just advance the billing date to stay in sync.
            sub.next_billing_date = advance_billing_date(sub.next_billing_date, plan.billing_frequency if plan else "monthly")
            db.commit()
            continue

        # Generate unique invoice number: INV-YEAR-SUBID-COUNT
        invoice_count = db.query(Invoice).filter(Invoice.subscription_id == sub.id).count() + 1
        inv_number = f"INV-{now.year}-{sub.id:04d}-{invoice_count:03d}"

        subtotal = 0.0
        tax_amount = 0.0
        discount_amount = 0.0

        invoice_lines = []

        # Check discount rule if attached
        discount = sub.discount
        can_apply_discount = False
        if discount and discount.is_active:
            # Check dates
            within_dates = True
            if discount.start_date and now < discount.start_date:
                within_dates = False
            if discount.end_date and now > discount.end_date:
                within_dates = False
            
            # Check usage limit
            within_usage = (discount.times_used < discount.max_usage)
            can_apply_discount = within_dates and within_usage

        # Process each subscription line
        total_sub_qty = sum(l.quantity for l in sub.lines)
        raw_subtotal = sum(l.quantity * l.unit_price for l in sub.lines)

        for line in sub.lines:
            line_subtotal = line.quantity * line.unit_price
            subtotal += line_subtotal
            
            # Line tax calculation
            rate = line.tax_rate if line.tax_rate is not None else default_tax_rate
            line_tax = round(line_subtotal * (rate / 100.0), 2)
            tax_amount += line_tax

            # Check product-specific discount
            if can_apply_discount and discount.applies_to_product_id == line.product_id:
                if (raw_subtotal >= discount.min_purchase) and (total_sub_qty >= discount.min_quantity):
                    if discount.discount_type == "percentage":
                        discount_amount += round(line_subtotal * (discount.value / 100.0), 2)
                    else:
                        discount_amount += min(discount.value, line_subtotal)

            prod_name = line.product.name if line.product else "Software Subscription"
            var_name = line.variant.variant_name if line.variant else None

            inv_line = InvoiceLine(
                product_name=prod_name,
                variant_name=var_name,
                quantity=line.quantity,
                unit_price=line.unit_price,
                tax_rate=rate,
                total_amount=line_subtotal + line_tax
            )
            invoice_lines.append(inv_line)

        # Whole subscription discount
        if can_apply_discount and (discount.applies_to_product_id is None):
            if (raw_subtotal >= discount.min_purchase) and (total_sub_qty >= discount.min_quantity):
                if discount.discount_type == "percentage":
                    discount_amount = round(subtotal * (discount.value / 100.0), 2)
                else:
                    discount_amount = min(discount.value, subtotal)
                
                # Increment usage and check expiry
                discount.times_used += 1
                if discount.times_used >= discount.max_usage:
                    discount.is_active = False

        total_amount = max(0.0, subtotal + tax_amount - discount_amount)
        due_date = now + datetime.timedelta(days=15)

        new_invoice = Invoice(
            invoice_number=inv_number,
            subscription_id=sub.id,
            customer_id=sub.customer_id,
            issue_date=now,
            due_date=due_date,
            status="Draft",
            subtotal=round(subtotal, 2),
            tax_amount=round(tax_amount, 2),
            discount_amount=round(discount_amount, 2),
            total_amount=round(total_amount, 2),
            lines=invoice_lines
        )

        db.add(new_invoice)
        
        # Advance the next billing date
        sub.next_billing_date = advance_billing_date(sub.next_billing_date, plan.billing_frequency if plan else "monthly")
        invoices_created.append(new_invoice)

    db.commit()
    return invoices_created
