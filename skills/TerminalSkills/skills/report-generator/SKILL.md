# Report Generator

## Overview

Generate professional data reports combining narrative text, charts, tables, and key metrics. Outputs HTML reports (viewable in any browser) or PDF. Suitable for executive summaries, weekly dashboards, data analysis reports, and client deliverables.

## Instructions

When a user asks you to generate a report, follow this process:

### Step 1: Install dependencies

```bash
pip install pandas matplotlib seaborn jinja2 weasyprint
# weasyprint is optional, needed only for PDF export
```

### Step 2: Understand the report requirements

Determine:
- **Data source:** CSV, Excel, database query results, or manually provided data
- **Report type:** Executive summary, detailed analysis, dashboard, recurring report
- **Audience:** Executives (high-level), analysts (detailed), clients (polished)
- **Key metrics:** What numbers matter most?
- **Output format:** HTML (default, no extra deps) or PDF (requires weasyprint)

### Step 3: Load and analyze the data

```python
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import base64
from io import BytesIO

# Load data
df = pd.read_csv("data.csv")

# Compute key metrics
metrics = {
    "total_revenue": df["revenue"].sum(),
    "avg_order_value": df["revenue"].mean(),
    "total_orders": len(df),
    "growth_rate": ((df[df["period"] == "current"]["revenue"].sum() /
                     df[df["period"] == "previous"]["revenue"].sum()) - 1) * 100,
}
```

### Step 4: Generate charts

Create charts and encode them as base64 for embedding in HTML:

```python
def fig_to_base64(fig):
    """Convert a matplotlib figure to a base64-encoded PNG string."""
    buf = BytesIO()
    fig.savefig(buf, format="png", dpi=150, bbox_inches="tight")
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("utf-8")

# Chart 1: Revenue trend
fig, ax = plt.subplots(figsize=(10, 5))
monthly = df.groupby("month")["revenue"].sum()
monthly.plot(kind="line", marker="o", ax=ax, color="#2563eb")
ax.set_title("Monthly Revenue Trend")
ax.set_ylabel("Revenue ($)")
ax.grid(True, alpha=0.3)
chart_trend = fig_to_base64(fig)
plt.close()

# Chart 2: Category breakdown
fig, ax = plt.subplots(figsize=(8, 5))
category_data = df.groupby("category")["revenue"].sum().sort_values(ascending=True)
category_data.plot(kind="barh", ax=ax, color="#22c55e")
ax.set_title("Revenue by Category")
ax.set_xlabel("Revenue ($)")
chart_category = fig_to_base64(fig)
plt.close()

# Chart 3: Distribution
fig, ax = plt.subplots(figsize=(8, 5))
sns.histplot(df["order_value"], bins=30, ax=ax, color="#8b5cf6")
ax.set_title("Order Value Distribution")
chart_distribution = fig_to_base64(fig)
plt.close()
```

### Step 5: Build the HTML report

```python
from jinja2 import Template

report_template = Template("""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ title }}</title>
    <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 40px; color: #1a1a1a; line-height: 1.6; }
        .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        h1 { color: #1e293b; margin-bottom: 5px; }
        .subtitle { color: #64748b; font-size: 14px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .metric-card { background: #f8fafc; border-radius: 8px; padding: 20px; border-left: 4px solid #2563eb; }
        .metric-value { font-size: 28px; font-weight: 700; color: #1e293b; }
        .metric-label { font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .chart-section { margin: 40px 0; }
        .chart-section img { max-width: 100%; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f1f5f9; padding: 12px; text-align: left; font-size: 13px; text-transform: uppercase; }
        td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
        .section { margin: 40px 0; }
        .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ title }}</h1>
        <div class="subtitle">Generated on {{ date }} | Period: {{ period }}</div>
    </div>

    <div class="metrics">
        {% for metric in metrics %}
        <div class="metric-card">
            <div class="metric-value">{{ metric.value }}</div>
            <div class="metric-label">{{ metric.label }}</div>
        </div>
        {% endfor %}
    </div>

    {% for section in sections %}
    <div class="section">
        <h2>{{ section.title }}</h2>
        <p>{{ section.description }}</p>
        {% if section.chart %}
        <div class="chart-section">
            <img src="data:image/png;base64,{{ section.chart }}" alt="{{ section.title }}">
        </div>
        {% endif %}
        {% if section.table %}
        {{ section.table }}
        {% endif %}
    </div>
    {% endfor %}

    <div class="footer">
        <p>This report was auto-generated. Data source: {{ data_source }}</p>
    </div>
</body>
</html>
""")

html = report_template.render(
    title="Monthly Performance Report",
    date=datetime.now().strftime("%B %d, %Y"),
    period="January 2025",
    data_source="sales_data.csv",
    metrics=[
        {"label": "Total Revenue", "value": f"${metrics['total_revenue']:,.0f}"},
        {"label": "Total Orders", "value": f"{metrics['total_orders']:,}"},
        {"label": "Avg Order Value", "value": f"${metrics['avg_order_value']:,.2f}"},
        {"label": "Growth Rate", "value": f"{metrics['growth_rate']:+.1f}%"},
    ],
    sections=[
        {
            "title": "Revenue Trend",
            "description": "Monthly revenue over the reporting period.",
            "chart": chart_trend,
            "table": None,
        },
        {
            "title": "Category Breakdown",
            "description": "Revenue distribution across product categories.",
            "chart": chart_category,
            "table": category_data.to_frame().to_html(classes="data-table"),
        },
    ],
)

# Save HTML
with open("report.html", "w") as f:
    f.write(html)
print("Report saved to report.html")
```

### Step 6: Convert to PDF (optional)

```python
# Using weasyprint
from weasyprint import HTML
HTML(string=html).write_pdf("report.pdf")
print("PDF saved to report.pdf")
```

Or use the browser-based approach:

```bash
# Using Chrome headless
google-chrome --headless --print-to-pdf=report.pdf report.html
```

## Examples

### Example 1: Weekly sales report

**User request:** "Generate a weekly sales report from this CSV"

**Actions:**

1. Load the CSV and filter to the current week
2. Compute KPIs: total revenue, orders, AOV, top product, conversion rate
3. Generate charts: daily revenue trend, top 10 products bar chart, channel pie chart
4. Build an HTML report with metric cards, charts, and a detailed transactions table
5. Save as report.html

**Output:** A polished HTML report with 4 KPI cards at the top, 3 charts, and a sortable table of transactions.

### Example 2: Executive summary from multiple data sources

**User request:** "Create an executive summary combining sales, support, and engagement data"

**Actions:**

1. Load three CSV files (sales.csv, support_tickets.csv, engagement.csv)
2. Compute cross-functional metrics: revenue, ticket resolution time, user retention
3. Generate a comparison chart showing month-over-month trends for all three areas
4. Write narrative summaries for each section highlighting key takeaways
5. Output as a PDF report

**Output:** A 3-page PDF with an overview dashboard, per-department sections, and a recommendations section.

### Example 3: Automated recurring report

**User request:** "Set up a monthly report template I can reuse"

**Actions:**

1. Create a Python script `generate_report.py` that accepts a CSV path and date range as arguments
2. Include all chart generation, metric computation, and HTML templating
3. Make it configurable via a `report_config.json` for title, metrics, and sections
4. Add CLI argument parsing for easy automation

**Output:** A reusable script the user can run monthly with `python generate_report.py --data sales.csv --period 2025-03`.

## Guidelines

- Always use the Agg backend for matplotlib (`matplotlib.use('Agg')`) to avoid display issues in headless environments.
- Embed charts as base64 in HTML so the report is a single self-contained file.
- Design for print: use readable fonts, sufficient contrast, and avoid overly wide layouts.
- Include the data source, generation date, and reporting period on every report.
- For metric cards, show both the value and the trend (up/down compared to prior period).
- Use consistent color schemes across all charts in a report.
- Keep executive summaries to one page of metrics and charts, with details in subsequent sections.
- For PDF output, test with weasyprint first. Fall back to Chrome headless if CSS rendering is problematic.
- Always validate data before generating reports. Missing or malformed data should be flagged, not silently ignored.
