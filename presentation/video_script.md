# 🎬 3-Minute Presentation & Demo Video Script
## Problem Statement: Brightloop Software - Subscription Management System
### Hackathon: Odoo x Make-A-Ton 9.0 Kochi Hackathon 2026

---

### [0:00 - 0:30] 🌟 1. The Hook & The Problem
**Speaker:**
> "Hello Evaluators! Meet **Brightloop Software**. Today, they face a nightmare every billing month:
> - Customer subscriptions are scattered in messy spreadsheets.
> - Renewals get completely forgotten.
> - Invoices are typed by hand, causing billing errors.
> - Payments are matched manually by scrolling through bank statements.
> - And worst of all: nobody knows their real Monthly Recurring Revenue (MRR).
> 
> Today, our team built the solution: a unified, high-performance **Odoo-grade Subscription Management Platform**."

---

### [0:30 - 1:15] 🛍️ 2. Live Storefront & Real-Time Sync Demo (The Wow Factor)
**Speaker:**
> "Let’s start with a live customer journey. 
> Brightloop launched **Odoo Cosmetics & Skincare Subscriptions** on our public storefront.
> Watch this:
> 1. A customer selects our flagship **Luxe Radiance Serum Box**.
> 2. They select the premium **Odoo Organic Brand Edition** variant—which adds exactly **+₹560** as required by the specification.
> 3. They customize with skincare add-ons and select a **Monthly** delivery cycle.
> 4. With 1 click, they hit **'Subscribe Now'**.
> 
> Now watch our Admin Finance Dashboard:
> **BOOM! In real time without refreshing**, our Active Subscriptions counter ticks up, and MRR recalculates instantly!"

---

### [1:15 - 2:00] ⚡ 3. The "Billing Day" Engine & Idempotency Guarantee
**Speaker:**
> "Next, let’s look at the core challenge: **Billing Day**.
> On billing day, hundreds of subscriptions are due at once. 
> We navigate to the **Billing Day** tab and click **'Execute Billing Day'**.
> 
> Behind the scenes:
> - Invoices are automatically generated with customer details, product lines, and tax rules.
> - Admin discount rules (like our volume rebate) are applied automatically.
> - Crucially, our engine guarantees **zero double-billing and zero skipped billing** through idempotent cycle tracking.
> - We can click **'Print / PDF'** to instantly inspect the official Odoo-styled invoice layout."

---

### [2:00 - 2:30] 👥 4. RBAC & Customer Self-Service Portal
**Speaker:**
> "We implemented strict Role-Based Access Control:
> - **Admin**: Manages products, plans, tax rules, and discount logic.
> - **Staff**: Manages quotations, confirms invoices, and records incoming bank payments.
> - **Customer Portal**: Customers log in securely (>8 char strong password rule) to see **only their own** active subscriptions and download invoice receipts without emailing support."

---

### [2:30 - 3:00] 📊 5. Finance Lead Metrics (<2s Performance SLA)
**Speaker:**
> "Finally, our **Finance Lead Overview** answers every executive question in milliseconds:
> - How many active subscriptions do we have?
> - What is our MRR and ARR?
> - How much revenue came in, and what is still overdue?
> 
> With sub-second SQLite and indexed queries, our page responds in **under 15 milliseconds**, comfortably exceeding the **2-second performance requirement**.
> 
> Built on a single branch with zero merge conflicts by our 4-person team. Thank you!"
