# Brightloop Software - API Specification & Data Contract
> **Single Source of Truth** for Backend and Frontend synchronization.
> Owned by Member 1 (Lead Architect).

---

## 1. Authentication & RBAC (`/api/auth`)
* `POST /api/auth/register` - Create customer account. Password validated: >8 characters, 1 uppercase, 1 lowercase, 1 special character.
* `POST /api/auth/login` - Authenticate user, returns JWT and user profile.
* `POST /api/auth/create-staff` - **Admin only**: Provision internal staff account.
* `POST /api/auth/forgot-password` - Generate password reset token and dispatch link.
* `POST /api/auth/reset-password` - Reset password with token.
* `GET /api/auth/me` - Profile of logged-in user.
* `GET /api/auth/customers` - List of customers.

---

## 2. Products & Variants (`/api/products`)
* `GET /api/products` - List active software, services, and add-on products with variants.
* `POST /api/products` - **Admin only**: Create product with name, type, sales price, cost price, and notes.
* `POST /api/products/{id}/variants` - **Admin only**: Add variant (e.g., Brand "Odoo" adds +₹560).

---

## 3. Plans & Rules (`/api/plans` & `/api/rules`)
* `GET /api/plans` - List plans (daily, weekly, monthly, yearly, min quantity, auto-close, pause rules).
* `POST /api/plans` - **Admin only**: Create/configure plan.
* `GET /api/rules/taxes` - List automatic tax rules.
* `POST /api/rules/taxes` - **Admin only**: Create tax rate rule.
* `GET /api/rules/discounts` - List discount rules.
* `POST /api/rules/discounts` - **Admin only**: Create fixed or percentage discount with thresholds, expiry, and max usage.

---

## 4. Subscriptions Pipeline (`/api/subscriptions`)
* `GET /api/subscriptions` - List subscriptions. Staff/Admin see all; Customers see only their own.
* `POST /api/subscriptions` - Create new subscription (starts in `Draft`).
* `POST /api/subscriptions/{id}/status` - Move lifecycle stage (`Draft` ➔ `Quotation` ➔ `Confirmed` ➔ `Active` ➔ `Paused` ➔ `Closed`).
* `GET /api/subscriptions/templates` - Quotation templates with pre-configured products and validity days.

---

## 5. Automated Billing Day (`/api/billing`)
* `POST /api/billing/run-billing-day` - Automated recurring run. Idempotent: strictly prevents double-billing or skipped billing. Applies tax rules and auto-discounts.
* `GET /api/billing/invoices` - List invoices with filters (`Draft`, `Confirmed`, `Paid`, `Canceled`, `OVERDUE`).
* `POST /api/billing/invoices/{id}/confirm` - Confirm draft invoice.
* `GET /api/billing/invoices/{id}/print` - Printable official Odoo-styled HTML invoice receipt.

---

## 6. Payments (`/api/payments`)
* `POST /api/payments/invoices/{id}` - Record payment against invoice (method: Bank Transfer, Credit Card, UPI, Cash; amount, date, reference, note). Auto-marks invoice as `Paid` upon full settlement.

---

## 7. Finance Analytics (`/api/analytics`)
* `GET /api/analytics/finance-summary` - Real-time metrics for Finance Lead:
  * `active_subscriptions`: Active contracts count.
  * `monthly_recurring_revenue_mrr`: Normalized MRR.
  * `annual_run_rate_arr`: Annualized run rate.
  * `total_revenue_collected`: Sum of verified payments.
  * `total_amount_owed`: Outstanding receivables.
  * `overdue_invoices_count` & `overdue_amount`: Overdue ledger.
  * `benchmark_latency_ms`: Response benchmark guaranteed < 2,000 ms.
