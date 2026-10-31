import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_waf_status():
    """Verify WAF telemetry endpoint reports active status and OWASP headers."""
    response = client.get("/api/firewall/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ACTIVE"
    assert data["mode"] == "ENFORCING"
    assert data["active_inspection_rules"] >= 20
    assert data["owasp_headers_enforced"] is True

def test_waf_blocks_sql_injection():
    """Verify WAF intercepts and returns HTTP 403 on SQL injection payload."""
    payload = {"query": "' OR '1'='1 --"}
    response = client.post("/api/firewall/test-probe", json=payload)
    assert response.status_code == 403
    data = response.json()
    assert data["status"] == "blocked"
    assert data["threat_type"] == "SQL_INJECTION"

def test_waf_blocks_xss_script():
    """Verify WAF intercepts and returns HTTP 403 on Cross-Site Scripting payload."""
    payload = {"message": "<script>alert('pwned')</script>"}
    response = client.post("/api/firewall/test-probe", json=payload)
    assert response.status_code == 403
    data = response.json()
    assert data["status"] == "blocked"
    assert data["threat_type"] == "XSS"

def test_waf_blocks_path_traversal():
    """Verify WAF intercepts and returns HTTP 403 on path traversal attempt."""
    payload = {"path": "../../etc/passwd"}
    response = client.post("/api/firewall/test-probe", json=payload)
    assert response.status_code == 403
    data = response.json()
    assert data["status"] == "blocked"
    assert data["threat_type"] == "PATH_TRAVERSAL"

def test_waf_allows_clean_payload():
    """Verify legitimate payloads pass inspection smoothly."""
    payload = {"product_name": "Sauvage Elixir 100ml", "quantity": 2}
    response = client.post("/api/firewall/test-probe", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "allowed"

def test_owasp_security_headers_injected():
    """Verify mandatory OWASP security headers on all responses."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-XSS-Protection") == "1; mode=block"
    assert "max-age=" in response.headers.get("Strict-Transport-Security", "")
    assert response.headers.get("X-Firewall-Protection") == "Odoo-Perfumes-WAF/v2.4-Active"

def test_real_pdf_invoice_download():
    """Verify that downloading an invoice produces an authentic binary PDF file."""
    from backend.app.database import SessionLocal
    from backend.app.models import Invoice, InvoiceLine, Subscription, SubscriptionLine, User, Plan, Product
    import datetime

    db = SessionLocal()
    inv = db.query(Invoice).first()
    if not inv:
        user = db.query(User).first()
        plan = db.query(Plan).first()
        sub = Subscription(
            subscription_number="SUB-TEST-001",
            customer_id=user.id if user else 1,
            plan_id=plan.id if plan else 1,
            status="Active",
            start_date=datetime.datetime.utcnow(),
            next_billing_date=datetime.datetime.utcnow() + datetime.timedelta(days=30),
            payment_terms="Immediate"
        )
        db.add(sub)
        db.flush()

        inv = Invoice(
            invoice_number="INV-TEST-001",
            subscription_id=sub.id,
            customer_id=user.id if user else 1,
            issue_date=datetime.datetime.utcnow(),
            due_date=datetime.datetime.utcnow(),
            status="Paid",
            subtotal=2490.0,
            tax_amount=448.2,
            total_amount=2938.2,
            lines=[InvoiceLine(product_name="Noir Test", quantity=1, unit_price=2490.0, tax_rate=18.0, total_amount=2938.2)]
        )
        db.add(inv)
        db.commit()
        db.refresh(inv)
    inv_id = inv.id
    db.close()

    response = client.get(f"/api/billing/invoices/{inv_id}/pdf")
    assert response.status_code == 200
    assert response.headers.get("Content-Type") == "application/pdf"
    assert "attachment; filename=" in response.headers.get("Content-Disposition", "")
    assert response.content.startswith(b"%PDF"), "Must be a genuine PDF document"
    assert len(response.content) > 1000, "PDF must have non-empty document content"
