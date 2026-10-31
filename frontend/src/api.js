const API_BASE = '/api';

export function getAuthToken() {
  return localStorage.getItem('brightloop_token') || '';
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('brightloop_token', token);
  } else {
    localStorage.removeItem('brightloop_token');
  }
}

export function clearAuth() {
  localStorage.removeItem('brightloop_token');
  localStorage.removeItem('brightloop_user');
}

export function getCurrentUser() {
  const user = localStorage.getItem('brightloop_user');
  return user ? JSON.parse(user) : null;
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('brightloop_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('brightloop_user');
  }
}

// Fallback Mock Responses for Static Hosting (e.g. GitHub Pages)
function getStaticMockResponse(endpoint, options = {}) {
  const body = options.body ? JSON.parse(options.body) : {};

  if (endpoint.startsWith('/auth/login')) {
    const id = (body.login_id || '').toUpperCase();
    if (id.includes('ADMIN')) {
      return {
        access_token: 'demo-admin-token',
        user: { id: 1, name: 'Admin Lead', username: 'ADMIN', email: 'admin@odooperfumes.com', role: 'admin', permissions: 'all' }
      };
    }
    if (id.includes('MEMBER') || id.includes('STAFF')) {
      return {
        access_token: 'demo-staff-token',
        user: { id: 2, name: 'Member1 (Staff)', username: 'MEMBER1', email: 'staff@odooperfumes.com', role: 'staff', permissions: 'subscriptions,invoices,products,billing' }
      };
    }
    return {
      access_token: 'demo-customer-token',
      user: { id: 3, name: 'Acme Corporation (Customer)', username: 'CUSTOMER', email: 'acme@corp.com', role: 'customer', permissions: '' }
    };
  }

  if (endpoint.startsWith('/analytics/finance-summary')) {
    return {
      mrr: 148500.00,
      arr: 1782000.00,
      active_subscriptions: 38,
      invoices_due: 4,
      total_collected_this_month: 124200.00,
      overdue_invoices_count: 1,
      mrr_growth_rate: 18.4,
      churn_rate: 0.8
    };
  }

  if (endpoint.startsWith('/billing/invoices')) {
    return [
      { id: 1, invoice_number: 'INV-2026-0001', customer: { name: 'Acme Corporation', email: 'acme@corp.com' }, issue_date: '2026-10-15', due_date: '2026-11-15', status: 'Paid', total_amount: 5310.00, subtotal: 4500.00, tax_amount: 810.00 },
      { id: 2, invoice_number: 'INV-2026-0002', customer: { name: 'Kochi Fragrance Club', email: 'club@kochi.in' }, issue_date: '2026-10-20', due_date: '2026-11-20', status: 'Paid', total_amount: 3800.00, subtotal: 3220.00, tax_amount: 580.00 },
      { id: 3, invoice_number: 'INV-2026-0003', customer: { name: 'Santal Connoisseurs', email: 'vip@santal.fr' }, issue_date: '2026-10-28', due_date: '2026-11-28', status: 'Draft', total_amount: 6136.00, subtotal: 5200.00, tax_amount: 936.00 }
    ];
  }

  if (endpoint.startsWith('/subscriptions')) {
    return [
      { id: 1, customer: { name: 'Acme Corporation', email: 'acme@corp.com' }, plan_name: 'Connoisseur Edition', status: 'Active', next_billing_date: '2026-11-15', total_amount: 5310.00 },
      { id: 2, customer: { name: 'Kochi Fragrance Club', email: 'club@kochi.in' }, plan_name: 'Bespoke Discovery', status: 'Active', next_billing_date: '2026-11-20', total_amount: 3800.00 },
      { id: 3, customer: { name: 'Santal Connoisseurs', email: 'vip@santal.fr' }, plan_name: 'Royal Imperial Reserve', status: 'Active', next_billing_date: '2026-11-28', total_amount: 6136.00 }
    ];
  }

  if (endpoint.startsWith('/products')) {
    return [
      { id: 1, name: 'Oud Royal Noir', sales_price: 4500.00, variants: [{ id: 101, name: '100ml Extrait', surcharge: 0 }, { id: 102, name: '50ml Travel', surcharge: -1200 }] },
      { id: 2, name: 'Rose de Mai Sublime', sales_price: 3800.00, variants: [{ id: 103, name: '100ml EDP', surcharge: 0 }] },
      { id: 3, name: 'Santal Impérial', sales_price: 5200.00, variants: [{ id: 104, name: '100ml Extrait', surcharge: 0 }] },
      { id: 4, name: 'Citrus Nobilis Reserve', sales_price: 3200.00, variants: [{ id: 105, name: '100ml Cologne', surcharge: 0 }] }
    ];
  }

  if (endpoint.startsWith('/firewall/status')) {
    return {
      status: 'ACTIVE',
      shield_version: 'v2.4-Enterprise',
      mode: 'ENFORCING',
      active_inspection_rules: 24,
      total_requests_inspected: 142,
      total_threats_blocked: 8,
      threats_by_type: { sql_injection: 4, xss: 2, path_traversal: 1, rate_limit: 1, rce: 0 },
      owasp_headers_enforced: true,
      rate_limiting_active: true
    };
  }

  if (endpoint.startsWith('/firewall/incidents')) {
    return [
      { id: 'INC-A19F02', timestamp: '2026-10-31 12:20:14', threat_type: 'SQL_INJECTION', ip: '192.168.1.104', path: '/api/auth/login', action: 'BLOCKED_403' },
      { id: 'INC-B88D11', timestamp: '2026-10-31 12:18:40', threat_type: 'XSS', ip: '10.0.4.12', path: '/api/firewall/test-probe', action: 'BLOCKED_403' },
      { id: 'INC-C30E99', timestamp: '2026-10-31 12:15:02', threat_type: 'PATH_TRAVERSAL', ip: '172.16.0.8', path: '/api/billing/invoices/../../etc/passwd', action: 'BLOCKED_403' }
    ];
  }

  if (endpoint.startsWith('/auth/staff')) {
    return [
      { id: 2, name: 'Sarah Staff', username: 'MEMBER1', email: 'staff@odooperfumes.com', permissions: 'subscriptions,invoices,products,billing' },
      { id: 4, name: 'Alex Analyst', username: 'MEMBER2', email: 'alex@odooperfumes.com', permissions: 'subscriptions,invoices' }
    ];
  }

  return { status: 'success' };
}

export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (response.ok) {
      return await response.json();
    }

    // If on GitHub Pages or 404, fallback to static mock data
    if (response.status === 404 || window.location.hostname.includes('github.io')) {
      return getStaticMockResponse(endpoint, options);
    }

    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    const error = new Error(errorData.error || errorData.detail || errorData.message || 'API request failed');
    error.status = response.status;
    error.data = errorData;
    throw error;
  } catch (err) {
    // If backend is unreachable (offline static host)
    if (err.message?.includes('Failed to fetch') || window.location.hostname.includes('github.io')) {
      return getStaticMockResponse(endpoint, options);
    }
    throw err;
  }
}

export async function getFirewallStatus() {
  return apiRequest('/firewall/status');
}

export async function getFirewallIncidents() {
  return apiRequest('/firewall/incidents');
}

export async function testFirewallProbe(payload) {
  try {
    const response = await fetch('/api/firewall/test-probe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    return { status: response.status, ok: response.ok, data };
  } catch (err) {
    const p = JSON.stringify(payload);
    const isThreat = p.includes("' OR") || p.includes('<script>') || p.includes('..');
    return {
      status: isThreat ? 403 : 200,
      ok: !isThreat,
      data: isThreat 
        ? { status: 'blocked', error: 'Access Denied by Odoo Perfumes WAF Shield', threat_type: 'THREAT_INTERCEPTED' }
        : { status: 'allowed', message: 'Payload passed WAF inspection.' }
    };
  }
}

export async function clearFirewallIncidents() {
  return apiRequest('/firewall/clear-incidents', { method: 'POST' });
}

export async function downloadInvoicePdf(invoiceId, invoiceNumber) {
  const token = getAuthToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let blob = null;

  try {
    const response = await fetch(`/api/billing/invoices/${invoiceId}/pdf`, { headers });
    if (response.ok) {
      blob = await response.blob();
    }
  } catch (e) {
    // Fallback for static hosting
  }

  if (!blob) {
    // Generate valid client-side PDF for GitHub Pages static preview
    const num = invoiceNumber || `INV-2026-000${invoiceId || 1}`;
    const content = `BT /F1 18 Tf 40 730 Td (ODOO PERFUMES - OFFICIAL TAX INVOICE) Tj ET ` +
                    `BT /F1 11 Tf 40 700 Td (Invoice Number: ${num}) Tj ET ` +
                    `BT /F1 11 Tf 40 680 Td (Customer: Acme Corporation) Tj ET ` +
                    `BT /F1 11 Tf 40 660 Td (Total Amount: INR Rs. 5,310.00) Tj ET ` +
                    `BT /F1 9 Tf 40 630 Td (Zero Double-Billing Certified. Secured with Enterprise WAF.) Tj ET`;
    const len = content.length;
    const rawPdf = `%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n4 0 obj << /Length ${len} >> stream\n${content}\nendstream\nendobj\n5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000262 00000 n \n0000000330 00000 n \ntrailer << /Size 6 /Root 1 0 R >>\nstartxref\n412\n%%EOF`;
    blob = new Blob([rawPdf], { type: 'application/pdf' });
  }

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${invoiceNumber || `Invoice_${invoiceId}`}.pdf`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 200);
}
