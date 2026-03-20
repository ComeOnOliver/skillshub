# Expense Report

## Overview

Organize, categorize, and summarize business expenses into professional reports. This skill processes expense data from receipts, CSV files, or manual entries, categorizes them by type, calculates totals, and generates formatted reports suitable for reimbursement submissions or tax preparation.

## Instructions

When a user asks to create an expense report or organize their expenses, follow these steps:

### Step 1: Collect expense data

Gather expenses from the available sources:

**From a CSV or spreadsheet:**
```python
import pandas as pd

def load_expenses_csv(file_path):
    df = pd.read_csv(file_path)
    # Normalize column names
    df.columns = [col.strip().lower() for col in df.columns]
    return df
```

**From manual entries:**
Prompt the user for each expense or accept a list:
- Date
- Description / Vendor
- Amount
- Category (assign automatically if not provided)
- Payment method (credit card, cash, reimbursable)

**From receipt images or PDFs:**
Extract data using OCR or text extraction, then structure into the same format.

### Step 2: Categorize expenses

Assign each expense to a standard category. Auto-categorize based on vendor name and description:

```python
CATEGORY_RULES = {
    "Travel": ["airline", "hotel", "uber", "lyft", "taxi", "flight", "airbnb", "rental car"],
    "Meals & Entertainment": ["restaurant", "cafe", "coffee", "lunch", "dinner", "doordash", "grubhub"],
    "Office Supplies": ["staples", "office depot", "amazon", "supplies"],
    "Software & Subscriptions": ["github", "aws", "google cloud", "slack", "zoom", "adobe", "saas"],
    "Transportation": ["gas", "parking", "toll", "metro", "transit"],
    "Professional Services": ["consulting", "legal", "accounting", "freelance"],
    "Communication": ["phone", "internet", "verizon", "att", "tmobile"],
    "Training & Education": ["course", "conference", "workshop", "udemy", "training"],
}

def categorize_expense(description):
    desc_lower = description.lower()
    for category, keywords in CATEGORY_RULES.items():
        if any(keyword in desc_lower for keyword in keywords):
            return category
    return "Other"
```

### Step 3: Calculate totals and summaries

```python
def summarize_expenses(df):
    summary = {
        "total": df['amount'].sum(),
        "by_category": df.groupby('category')['amount'].sum().to_dict(),
        "by_month": df.groupby(df['date'].dt.to_period('M'))['amount'].sum().to_dict(),
        "count": len(df),
        "date_range": f"{df['date'].min()} to {df['date'].max()}",
        "avg_per_expense": df['amount'].mean(),
        "largest_expense": df.loc[df['amount'].idxmax()].to_dict()
    }
    return summary
```

### Step 4: Generate the report

**Excel report with multiple sheets:**

```python
def generate_excel_report(df, summary, output_path="expense_report.xlsx"):
    with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
        # Summary sheet
        summary_df = pd.DataFrame([
            {"Metric": "Total Expenses", "Value": f"${summary['total']:.2f}"},
            {"Metric": "Number of Expenses", "Value": summary['count']},
            {"Metric": "Date Range", "Value": summary['date_range']},
            {"Metric": "Average per Expense", "Value": f"${summary['avg_per_expense']:.2f}"},
        ])
        summary_df.to_excel(writer, sheet_name='Summary', index=False)

        # Category breakdown
        cat_df = pd.DataFrame([
            {"Category": cat, "Total": f"${amt:.2f}"}
            for cat, amt in sorted(summary['by_category'].items(), key=lambda x: -x[1])
        ])
        cat_df.to_excel(writer, sheet_name='By Category', index=False)

        # All expenses detail
        df.to_excel(writer, sheet_name='All Expenses', index=False)

    return output_path
```

**Markdown summary for quick review:**

```python
def generate_markdown_summary(summary):
    lines = [
        "# Expense Report Summary",
        f"**Period:** {summary['date_range']}",
        f"**Total Expenses:** ${summary['total']:.2f}",
        f"**Number of Items:** {summary['count']}",
        "",
        "## By Category",
    ]
    for cat, amt in sorted(summary['by_category'].items(), key=lambda x: -x[1]):
        pct = (amt / summary['total']) * 100
        lines.append(f"- **{cat}:** ${amt:.2f} ({pct:.1f}%)")
    return "\n".join(lines)
```

### Step 5: Present results and flag issues

Display the summary and flag any potential issues:
- Expenses missing receipts
- Unusually large individual expenses
- Expenses outside the reporting period
- Duplicate entries (same vendor, amount, and date)

## Examples

### Example 1: Monthly expense report from CSV

**User request:** "Create an expense report from my expenses.csv file for January"

**Actions taken:**
1. Load and parse expenses.csv
2. Filter to January entries
3. Auto-categorize 34 expenses
4. Generate summary and Excel report

**Output:**
```
Expense Report: January 2025
=============================
Total Expenses: $4,287.50
Number of Items: 34
Average per Expense: $126.10

By Category:
  Travel:                   $1,850.00 (43.1%)
  Software & Subscriptions:   $680.00 (15.9%)
  Meals & Entertainment:      $542.30 (12.7%)
  Office Supplies:            $418.20 (9.8%)
  Transportation:             $365.00 (8.5%)
  Professional Services:      $320.00 (7.5%)
  Other:                      $112.00 (2.6%)

Top 3 Expenses:
  1. $890.00 - Delta Airlines (Jan 15)
  2. $520.00 - Marriott Hotel (Jan 15-16)
  3. $320.00 - Legal consultation (Jan 22)

Flags:
  - 2 potential duplicates found (review recommended)
  - 3 expenses over $200 may require manager approval

Report saved: expense_report_jan_2025.xlsx
```

### Example 2: Annual tax expense summary

**User request:** "Summarize all my business expenses from 2024 for tax filing"

**Actions taken:**
1. Load expense data for full year
2. Categorize using IRS Schedule C categories
3. Generate annual summary with monthly breakdown

**Output:**
```
Annual Expense Summary: 2024
============================
Total Business Expenses: $48,320.75

IRS Schedule C Categories:
  Advertising:                  $3,200.00
  Car & Truck Expenses:         $4,850.00
  Contract Labor:               $8,400.00
  Insurance:                    $2,160.00
  Office Expenses:              $5,680.00
  Supplies:                     $2,340.00
  Travel:                      $12,450.00
  Meals (50% deductible):       $4,280.75
  Utilities:                    $1,920.00
  Other:                        $3,040.00

Monthly Trend:
  Highest month: November ($6,420)
  Lowest month: August ($2,180)

Report saved: annual_expenses_2024.xlsx
```

### Example 3: Organize receipts from a business trip

**User request:** "I just got back from a conference in Chicago. Organize these receipts: flights $450, hotel 3 nights $180/night, Uber rides $85, meals $220, conference ticket $399"

**Output:**
```
Business Trip Expense Report: Chicago Conference
=================================================
Total: $1,694.00

Expenses:
  Date       | Category      | Description           | Amount
  ---------- | ------------- | --------------------- | --------
  [Trip]     | Travel        | Round-trip flights     | $450.00
  [Trip]     | Travel        | Hotel (3 nights)       | $540.00
  [Trip]     | Transportation| Uber rides             | $85.00
  [Trip]     | Meals         | Meals during trip      | $220.00
  [Trip]     | Training      | Conference registration| $399.00

Summary:
  Travel & Lodging:   $990.00 (58.4%)
  Meals:              $220.00 (13.0%)
  Training:           $399.00 (23.6%)
  Transportation:      $85.00 (5.0%)

Note: Fill in specific dates for each expense before submitting.
Report saved: trip_expense_chicago.xlsx
```

## Guidelines

- Auto-categorize expenses by default but allow the user to override categories.
- Always flag potential duplicates (same vendor, amount, and date within 1 day).
- Use standard business expense categories that align with common reimbursement policies and IRS Schedule C.
- For tax reports, note which categories have special deduction rules (e.g., meals at 50%).
- Format all currency amounts consistently with two decimal places.
- When generating Excel reports, include a summary sheet, category breakdown, and full detail sheet.
- Date formats should be consistent. Parse and normalize dates from various input formats.
- Never assume tax rates or reimbursement policies. Present the data and let the user or their accountant make tax decisions.
- Install pandas and openpyxl with `pip install pandas openpyxl` if not available.