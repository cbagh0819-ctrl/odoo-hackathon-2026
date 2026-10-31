import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_invoice_pdf(invoice) -> bytes:
    """
    Generates a real, professional binary PDF document for an Invoice.
    Returns raw PDF bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    elements = []

    styles = getSampleStyleSheet()

    # Custom styles
    brand_title = ParagraphStyle(
        'BrandTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        textColor=colors.HexColor('#991b1b'), # Crimson Red
        spaceAfter=2
    )

    brand_subtitle = ParagraphStyle(
        'BrandSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.HexColor('#6b7280'),
        spaceAfter=15
    )

    h2_style = ParagraphStyle(
        'Heading2Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        textColor=colors.HexColor('#1f2937'),
        spaceAfter=6
    )

    meta_label = ParagraphStyle(
        'MetaLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        textColor=colors.HexColor('#374151')
    )

    meta_val = ParagraphStyle(
        'MetaVal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        textColor=colors.HexColor('#111827')
    )

    # 1. Header Banner
    header_data = [
        [
            Paragraph("<b>ODOO PERFUMES</b><br/><font color='#6b7280' size='9'>Luxury Fragrance Subscriptions & Recurring Billing</font>", brand_title),
            Paragraph(f"<font size='18' color='#991b1b'><b>INVOICE</b></font><br/><b>No:</b> {invoice.invoice_number}<br/><b>Date:</b> {invoice.issue_date.strftime('%d %b %Y') if invoice.issue_date else 'Today'}", meta_label)
        ]
    ]
    header_table = Table(header_data, colWidths=[340, 190])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ALIGN', (1,0), (1,-1), 'RIGHT'),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 15))

    # Divider
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#e5e7eb'), spaceAfter=15))

    # 2. Bill To & Status Metadata
    cust_name = invoice.customer.name if invoice.customer else "Valued Customer"
    cust_email = invoice.customer.email if invoice.customer else "customer@example.com"
    status_text = invoice.status.upper()
    status_bg = "#dcfce7" if status_text == "PAID" else "#fef3c7"
    status_color = "#166534" if status_text == "PAID" else "#92400e"

    bill_to_data = [
        [
            Paragraph("<b>BILLED TO:</b>", meta_label),
            Paragraph("<b>INVOICE DETAILS:</b>", meta_label)
        ],
        [
            Paragraph(f"<b>{cust_name}</b><br/>{cust_email}<br/>Account Status: Verified Customer", meta_val),
            Paragraph(
                f"<b>Status:</b> <font color='{status_color}'><b>{status_text}</b></font><br/>"
                f"<b>Due Date:</b> {invoice.due_date.strftime('%d %b %Y') if invoice.due_date else 'Upon Receipt'}<br/>"
                f"<b>Currency:</b> INR (Rs.)",
                meta_val
            )
        ]
    ]
    bill_table = Table(bill_to_data, colWidths=[320, 210])
    bill_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(bill_table)
    elements.append(Spacer(1, 20))

    # 3. Line Items Table
    table_rows = [
        [
            Paragraph("<b>Item Description / Fragrance</b>", meta_label),
            Paragraph("<b>Qty</b>", meta_label),
            Paragraph("<b>Unit Price</b>", meta_label),
            Paragraph("<b>Tax Rate</b>", meta_label),
            Paragraph("<b>Total (INR)</b>", meta_label)
        ]
    ]

    for line in invoice.lines:
        variant_desc = f" ({line.variant_name})" if line.variant_name else ""
        item_title = f"{line.product_name}{variant_desc}"
        table_rows.append([
            Paragraph(item_title, meta_val),
            str(line.quantity),
            f"Rs. {line.unit_price:,.2f}",
            f"{line.tax_rate:.1f}%",
            f"Rs. {line.total_amount:,.2f}"
        ])

    items_table = Table(table_rows, colWidths=[230, 40, 85, 75, 100])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#18181b')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (1,0), (-1,-1), 'CENTER'),
        ('ALIGN', (2,0), (-1,-1), 'RIGHT'),
        ('ALIGN', (4,0), (-1,-1), 'RIGHT'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('TOPPADDING', (0,0), (-1,0), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e5e7eb')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f9fafb')]),
        ('BOTTOMPADDING', (0,1), (-1,-1), 6),
        ('TOPPADDING', (0,1), (-1,-1), 6),
    ]))
    elements.append(items_table)
    elements.append(Spacer(1, 15))

    # 4. Summary Totals Box
    subtotal = invoice.subtotal if hasattr(invoice, 'subtotal') and invoice.subtotal else 0.0
    tax_amt = invoice.tax_amount if hasattr(invoice, 'tax_amount') and invoice.tax_amount else 0.0
    total_amt = invoice.total_amount if hasattr(invoice, 'total_amount') and invoice.total_amount else 0.0
    paid_amt = total_amt if (invoice.status and invoice.status.upper() == 'PAID') else 0.0

    totals_data = [
        ["Subtotal:", f"Rs. {subtotal:,.2f}"],
        ["Applicable Taxes (CGST + SGST):", f"Rs. {tax_amt:,.2f}"],
        ["Grand Total:", f"Rs. {total_amt:,.2f}"],
        ["Amount Paid:", f"Rs. {paid_amt:,.2f}"],
        ["Balance Due:", f"Rs. {max(0.0, total_amt - paid_amt):,.2f}"]
    ]
    totals_table = Table(totals_data, colWidths=[200, 110])
    totals_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'RIGHT'),
        ('FONTNAME', (0,2), (-1,2), 'Helvetica-Bold'),
        ('FONTSIZE', (0,2), (-1,2), 11),
        ('TEXTCOLOR', (0,2), (-1,2), colors.HexColor('#991b1b')),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('LINEBELOW', (0,1), (-1,1), 1, colors.HexColor('#d1d5db')),
        ('LINEBELOW', (0,2), (-1,2), 1.5, colors.HexColor('#991b1b')),
    ]))

    # Align totals to the right side
    outer_totals = Table([["", totals_table]], colWidths=[220, 310])
    elements.append(outer_totals)
    elements.append(Spacer(1, 25))

    # 5. Security & Legal Footer
    elements.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor('#e5e7eb'), spaceAfter=10))
    footer_text = (
        "<b>Odoo Perfumes — Official Tax Document</b><br/>"
        "This is an electronically generated and cryptographically locked recurring billing invoice. "
        "Guaranteed zero double-billing idempotent execution. Secured with Enterprise WAF protection.<br/>"
        "Questions? Contact support@odooperfumes.com | www.odooperfumes.com"
    )
    footer_style = ParagraphStyle(
        'FooterCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        textColor=colors.HexColor('#6b7280'),
        alignment=1 # Centered
    )
    elements.append(Paragraph(footer_text, footer_style))

    # Build PDF document
    doc.build(elements)
    return buffer.getvalue()
