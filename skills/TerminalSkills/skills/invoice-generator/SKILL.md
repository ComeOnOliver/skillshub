# Invoice Generator

## Overview

Generate professional, properly formatted invoices as PDF documents. This skill creates invoices with line items, tax calculations, payment terms, and branding. Supports multiple currencies, tax rates, discounts, and customizable layouts.

## Instructions

When a user asks to create or generate an invoice, follow these steps:

### Step 1: Gather invoice details

Collect the required information from the user:
- **Sender**: Company name, address, email, phone, logo (optional)
- **Recipient**: Client name, address, contact information
- **Invoice number**: Auto-generate or use the user's numbering scheme
- **Date and due date**: Issue date and payment due date
- **Line items**: Description, quantity, unit price for each item/service
- **Tax rate**: Percentage and type (VAT, sales tax, GST)
- **Currency**: USD, EUR, GBP, etc.
- **Payment terms**: Net 30, Net 60, payment methods accepted
- **Notes**: Any additional terms or messages

### Step 2: Calculate totals

```python
def calculate_invoice(items, tax_rate=0, discount=0):
    subtotal = sum(item['quantity'] * item['unit_price'] for item in items)
    discount_amount = subtotal * (discount / 100)
    taxable_amount = subtotal - discount_amount
    tax_amount = taxable_amount * (tax_rate / 100)
    total = taxable_amount + tax_amount
    return {
        "subtotal": round(subtotal, 2),
        "discount": round(discount_amount, 2),
        "taxable_amount": round(taxable_amount, 2),
        "tax": round(tax_amount, 2),
        "total": round(total, 2)
    }
```

### Step 3: Generate the invoice PDF

Use reportlab to create a clean, professional PDF:

```python
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

def generate_invoice(data, output_path="invoice.pdf"):
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []

    # Header with company info
    elements.append(Paragraph(data['sender']['name'], styles['Title']))
    elements.append(Paragraph(data['sender']['address'], styles['Normal']))
    elements.append(Spacer(1, 0.3 * inch))

    # Invoice details
    elements.append(Paragraph(f"Invoice #{data['invoice_number']}", styles['Heading2']))
    elements.append(Paragraph(f"Date: {data['date']}", styles['Normal']))
    elements.append(Paragraph(f"Due: {data['due_date']}", styles['Normal']))
    elements.append(Spacer(1, 0.3 * inch))

    # Bill to
    elements.append(Paragraph("Bill To:", styles['Heading3']))
    elements.append(Paragraph(data['recipient']['name'], styles['Normal']))
    elements.append(Paragraph(data['recipient']['address'], styles['Normal']))
    elements.append(Spacer(1, 0.3 * inch))

    # Line items table
    table_data = [['Description', 'Qty', 'Unit Price', 'Amount']]
    currency = data.get('currency', '$')
    for item in data['items']:
        amount = item['quantity'] * item['unit_price']
        table_data.append([
            item['description'],
            str(item['quantity']),
            f"{currency}{item['unit_price']:.2f}",
            f"{currency}{amount:.2f}"
        ])

    # Totals rows
    totals = data['totals']
    table_data.append(['', '', 'Subtotal:', f"{currency}{totals['subtotal']:.2f}"])
    if totals.get('discount', 0) > 0:
        table_data.append(['', '', 'Discount:', f"-{currency}{totals['discount']:.2f}"])
    if totals.get('tax', 0) > 0:
        table_data.append(['', '', f"Tax ({data.get('tax_rate', 0)}%):", f"{currency}{totals['tax']:.2f}"])
    table_data.append(['', '', 'TOTAL:', f"{currency}{totals['total']:.2f}"])

    table = Table(table_data, colWidths=[3.5*inch, 0.8*inch, 1.2*inch, 1.2*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a1a2e')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (2, -1), (3, -1), 'Helvetica-Bold'),
    ]))
    elements.append(table)

    # Payment terms
    elements.append(Spacer(1, 0.5 * inch))
    if data.get('payment_terms'):
        elements.append(Paragraph(f"Payment Terms: {data['payment_terms']}", styles['Normal']))
    if data.get('notes'):
        elements.append(Paragraph(f"Notes: {data['notes']}", styles['Normal']))

    doc.build(elements)
    return output_path
```

### Step 4: Verify and present the output

After generating the PDF:
1. Confirm the file was created successfully
2. Display a summary of the invoice details
3. Show the file path and size

## Examples

### Example 1: Simple freelance invoice

**User request:** "Create an invoice for my client Acme Corp for 40 hours of consulting at $150/hour"

**Actions taken:**
1. Generate invoice number INV-2025-001
2. Calculate totals: 40 x $150 = $6,000
3. Generate PDF

**Output:**
```
Invoice generated: invoice_acme_corp.pdf

  Invoice #: INV-2025-001
  Date: January 15, 2025
  Due: February 14, 2025 (Net 30)

  Bill To: Acme Corp

  Line Items:
    Consulting Services - 40 hrs @ $150.00 = $6,000.00

  Subtotal:  $6,000.00
  Total:     $6,000.00

  File saved: invoice_acme_corp.pdf (42 KB)
```

### Example 2: Multi-item invoice with tax

**User request:** "Invoice for TechStart Ltd: website design $3,500, SEO setup $1,200, hosting 12 months at $29/mo. Add 20% VAT. Currency EUR."

**Actions taken:**
1. Build line items with three entries
2. Calculate subtotal, VAT, and total in EUR
3. Generate professional PDF

**Output:**
```
Invoice generated: invoice_techstart.pdf

  Invoice #: INV-2025-002
  Currency: EUR

  Line Items:
    Website Design          1 x EUR 3,500.00 = EUR 3,500.00
    SEO Setup               1 x EUR 1,200.00 = EUR 1,200.00
    Web Hosting (12 months) 12 x EUR 29.00   = EUR 348.00

  Subtotal:   EUR 5,048.00
  VAT (20%):  EUR 1,009.60
  Total:      EUR 6,057.60

  File saved: invoice_techstart.pdf (45 KB)
```

### Example 3: Invoice with discount

**User request:** "Create an invoice for Project Alpha: development $8,000, QA testing $2,000. Give 10% early payment discount. Net 15 terms."

**Output:**
```
Invoice generated: invoice_project_alpha.pdf

  Line Items:
    Software Development  1 x $8,000.00 = $8,000.00
    QA Testing            1 x $2,000.00 = $2,000.00

  Subtotal:          $10,000.00
  Discount (10%):    -$1,000.00
  Total:              $9,000.00

  Payment Terms: Net 15 - 10% early payment discount applied
```

## Guidelines

- Always auto-generate an invoice number if the user does not provide one. Use the format INV-YYYY-NNN.
- Default payment terms to Net 30 unless the user specifies otherwise.
- Use the current date as the invoice date if not specified.
- Format currency amounts consistently with two decimal places and the correct currency symbol.
- Calculate tax on the post-discount amount, not the subtotal.
- Install reportlab with `pip install reportlab` if not available.
- Keep the design clean and professional. Use minimal colors and clear typography.
- Include all legally required information: sender details, recipient details, invoice number, date, line items with prices, and total.