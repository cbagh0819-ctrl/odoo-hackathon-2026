import datetime
from app.database import SessionLocal, Base, engine
from app.models import (
    User, Product, ProductVariant, Plan, TaxRule, DiscountRule,
    QuotationTemplate, QuotationTemplateLine, Subscription, SubscriptionLine,
    Invoice, InvoiceLine, Payment
)
from app.auth import hash_password

def seed_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing data for fresh seed if needed
    if db.query(User).count() > 0:
        print("Database already contains data. Skipping seed.")
        db.close()
        return

    print("[*] Seeding Brightloop Software initial database...")

    # 1. Users & Roles (Strict Password compliance: >8 chars, upper, lower, special)
    admin = User(
        name="Admin Lead",
        email="admin@brightloop.com",
        password_hash=hash_password("Brightloop@2026"),
        role="admin"
    )
    staff = User(
        name="Sarah Staff (Billing & Sales)",
        email="staff@brightloop.com",
        password_hash=hash_password("Brightloop@2026"),
        role="staff"
    )
    cust1 = User(
        name="Acme Corporation (John Doe)",
        email="acme@corp.com",
        password_hash=hash_password("Customer@2026"),
        role="customer"
    )
    cust2 = User(
        name="Kochi Tech Store (Jane Smith)",
        email="techstore@shop.com",
        password_hash=hash_password("Customer@2026"),
        role="customer"
    )
    db.add_all([admin, staff, cust1, cust2])
    db.flush()

    # 2. Products & Variants (Per PDF: e.g. choosing Odoo brand adds 560 to price)
    p1 = Product(
        name="Brightloop Business Suite",
        product_type="Software",
        sales_price=1500.0,
        cost_price=500.0,
        notes="Flagship ERP & Operations platform."
    )
    p2 = Product(
        name="Automated Invoicing Engine",
        product_type="Software",
        sales_price=800.0,
        cost_price=200.0,
        notes="High-throughput recurring billing processor."
    )
    p3 = Product(
        name="Client Self-Service Portal",
        product_type="Add-on",
        sales_price=350.0,
        cost_price=80.0,
        notes="White-label portal for invoice and subscription management."
    )
    p4 = Product(
        name="24/7 Dedicated Support SLA",
        product_type="Service",
        sales_price=600.0,
        cost_price=300.0,
        notes="Priority ticketing and phone resolution."
    )
    db.add_all([p1, p2, p3, p4])
    db.flush()

    # Variants (Per PDF: Choosing the Odoo brand adds 560 to the price)
    v1 = ProductVariant(
        product_id=p1.id,
        variant_name="Brand: Odoo Enterprise Edition",
        attribute_name="Brand",
        attribute_value="Odoo",
        price_extra=560.0
    )
    v2 = ProductVariant(
        product_id=p1.id,
        variant_name="Brand: Standard Open Edition",
        attribute_name="Brand",
        attribute_value="Standard",
        price_extra=0.0
    )
    db.add_all([v1, v2])
    db.flush()

    # 3. Plans (Per PDF: daily, weekly, monthly or yearly, min qty, rules)
    plan_monthly = Plan(
        name="Professional Monthly Plan",
        cost=1500.0,
        billing_frequency="monthly",
        min_quantity=1,
        auto_close_on_end=False,
        allow_early_close=True,
        allow_pause=True,
        allow_renew=True
    )
    plan_yearly = Plan(
        name="Enterprise Annual Contract",
        cost=15000.0,
        billing_frequency="yearly",
        min_quantity=5,
        auto_close_on_end=True,
        allow_early_close=False,
        allow_pause=False,
        allow_renew=True
    )
    plan_weekly = Plan(
        name="Rapid Sprint Weekly Plan",
        cost=400.0,
        billing_frequency="weekly",
        min_quantity=1,
        auto_close_on_end=True,
        allow_early_close=True,
        allow_pause=True,
        allow_renew=True
    )
    db.add_all([plan_monthly, plan_yearly, plan_weekly])
    db.flush()

    # 4. Tax Rules
    tax_standard = TaxRule(name="Standard GST 18%", rate_percent=18.0, is_default=True)
    tax_reduced = TaxRule(name="Special Export Tax 0%", rate_percent=0.0, is_default=False)
    db.add_all([tax_standard, tax_reduced])
    db.flush()

    # 5. Discount Rules (Per PDF: Admin created, fixed or %, min purchase/qty, usage limits)
    disc1 = DiscountRule(
        code="ODOO2026",
        name="Hackathon Welcome Discount",
        discount_type="percentage",
        value=15.0,  # 15% off
        min_purchase=1000.0,
        min_quantity=1,
        max_usage=50,
        times_used=2,
        is_active=True
    )
    disc2 = DiscountRule(
        code="FLAT500",
        name="Volume Seat Rebate",
        discount_type="fixed",
        value=500.0,
        min_purchase=2500.0,
        min_quantity=3,
        max_usage=20,
        times_used=1,
        is_active=True
    )
    db.add_all([disc1, disc2])
    db.flush()

    # 6. Quotation Template (Per PDF: pre-configured plan and product lines)
    tpl = QuotationTemplate(
        name="Complete Odoo Enterprise Bundle",
        validity_days=30,
        plan_id=plan_monthly.id,
        notes="Standard offer for growing companies requiring Odoo ERP integration."
    )
    db.add(tpl)
    db.flush()

    tpl_line1 = QuotationTemplateLine(
        template_id=tpl.id,
        product_id=p1.id,
        variant_id=v1.id,
        quantity=2,
        unit_price=2060.0  # 1500 base + 560 Odoo variant
    )
    tpl_line2 = QuotationTemplateLine(
        template_id=tpl.id,
        product_id=p3.id,
        quantity=1,
        unit_price=350.0
    )
    db.add_all([tpl_line1, tpl_line2])
    db.flush()

    # 7. Subscriptions (Across lifecycle states: Draft, Quotation, Confirmed, Active)
    now = datetime.datetime.utcnow()

    # Sub 1: Active and due for billing right now (Acme Corp)
    sub_active1 = Subscription(
        subscription_number="SUB-2026-0001",
        customer_id=cust1.id,
        plan_id=plan_monthly.id,
        status="Active",
        start_date=now - datetime.timedelta(days=32),
        expiry_date=now + datetime.timedelta(days=330),
        next_billing_date=now - datetime.timedelta(days=1), # Due for Billing Day!
        payment_terms="Net 15",
        discount_rule_id=disc1.id
    )
    # Sub 2: Active on yearly plan (Kochi Tech Store)
    sub_active2 = Subscription(
        subscription_number="SUB-2026-0002",
        customer_id=cust2.id,
        plan_id=plan_yearly.id,
        status="Active",
        start_date=now - datetime.timedelta(days=10),
        expiry_date=now + datetime.timedelta(days=355),
        next_billing_date=now + datetime.timedelta(days=350),
        payment_terms="Immediate Payment"
    )
    # Sub 3: In Quotation state
    sub_quote = Subscription(
        subscription_number="SUB-2026-0003",
        customer_id=cust2.id,
        plan_id=plan_monthly.id,
        status="Quotation",
        start_date=now,
        next_billing_date=now,
        payment_terms="Net 30"
    )
    db.add_all([sub_active1, sub_active2, sub_quote])
    db.flush()

    # Lines for Sub 1
    sline1 = SubscriptionLine(
        subscription_id=sub_active1.id,
        product_id=p1.id,
        variant_id=v1.id,
        quantity=3,
        unit_price=2060.0,
        tax_rate=18.0,
        amount=6180.0
    )
    sline2 = SubscriptionLine(
        subscription_id=sub_active1.id,
        product_id=p4.id,
        quantity=1,
        unit_price=600.0,
        tax_rate=18.0,
        amount=600.0
    )
    # Lines for Sub 2
    sline3 = SubscriptionLine(
        subscription_id=sub_active2.id,
        product_id=p1.id,
        variant_id=v2.id,
        quantity=5,
        unit_price=1500.0,
        tax_rate=18.0,
        amount=7500.0
    )
    # Lines for Sub 3
    sline4 = SubscriptionLine(
        subscription_id=sub_quote.id,
        product_id=p2.id,
        quantity=1,
        unit_price=800.0,
        tax_rate=18.0,
        amount=800.0
    )
    db.add_all([sline1, sline2, sline3, sline4])
    db.flush()

    # 8. Sample Past Invoices & Payments
    past_inv = Invoice(
        invoice_number="INV-2026-0001-001",
        subscription_id=sub_active1.id,
        customer_id=cust1.id,
        issue_date=now - datetime.timedelta(days=30),
        due_date=now - datetime.timedelta(days=15),
        status="Paid",
        subtotal=6780.0,
        tax_amount=1220.4,
        discount_amount=1017.0,
        total_amount=6983.4
    )
    db.add(past_inv)
    db.flush()

    inv_l1 = InvoiceLine(
        invoice_id=past_inv.id,
        product_name="Brightloop Business Suite",
        variant_name="Brand: Odoo Enterprise Edition",
        quantity=3,
        unit_price=2060.0,
        tax_rate=18.0,
        total_amount=6180.0 + 1112.4
    )
    db.add(inv_l1)
    db.flush()

    # Recorded Payment
    payment1 = Payment(
        invoice_id=past_inv.id,
        amount=6983.4,
        payment_method="Bank Transfer",
        payment_date=now - datetime.timedelta(days=20),
        note="NEFT payment received from Acme Corp",
        reference_code="TXN-OD-98214"
    )
    db.add(payment1)

    db.commit()
    db.close()
    print("[SUCCESS] Brightloop Software seed database populated successfully!")

if __name__ == "__main__":
    seed_data()
