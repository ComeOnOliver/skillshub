# Document Parser

## Overview

Parse complex documents containing tables, figures, multi-column layouts, headers, and mixed content using IBM's docling library. This skill goes beyond simple text extraction by understanding document structure, detecting layout regions, and preserving the logical reading order across complex formatting.

## Instructions

When a user asks to parse a complex document or extract structured content from a document with tables, figures, or multi-column layouts, follow these steps:

### Step 1: Install docling

```bash
pip install docling
```

### Step 2: Load and convert the document

Use docling's DocumentConverter to parse the document:

```python
from docling.document_converter import DocumentConverter

def parse_document(file_path):
    converter = DocumentConverter()
    result = converter.convert(file_path)
    return result
```

Supported input formats: PDF, DOCX, PPTX, HTML, images (PNG, JPG).

### Step 3: Export to the desired format

**Export as Markdown** (preserves headings, tables, lists):

```python
def to_markdown(result):
    return result.document.export_to_markdown()
```

**Export as structured JSON** (full document tree):

```python
import json

def to_json(result):
    doc_dict = result.document.export_to_dict()
    return json.dumps(doc_dict, indent=2)
```

**Extract only tables:**

```python
def extract_tables(result):
    tables = []
    for table in result.document.tables:
        df = table.export_to_dataframe()
        tables.append(df)
    return tables
```

### Step 4: Handle specific content types

**For tables**: Export each table as a pandas DataFrame or CSV:

```python
import pandas as pd

def save_tables(result, output_dir="."):
    for i, table in enumerate(result.document.tables):
        df = table.export_to_dataframe()
        output_path = f"{output_dir}/table_{i+1}.csv"
        df.to_csv(output_path, index=False)
    return f"Saved {len(result.document.tables)} tables"
```

**For figures**: Extract figure metadata and captions:

```python
def extract_figures(result):
    figures = []
    for item in result.document.items:
        if hasattr(item, 'image') and item.image:
            figures.append({
                "caption": getattr(item, 'caption', 'No caption'),
                "page": getattr(item, 'page_no', None)
            })
    return figures
```

### Step 5: Present the results

Format output based on user needs:
- **Full document**: Markdown export with all content preserved
- **Tables only**: CSV files or formatted markdown tables
- **Summary**: Document structure outline with section headings and content types found
- **Specific sections**: Extract targeted parts by heading or page range

## Examples

### Example 1: Parse an academic paper

**User request:** "Parse this research paper and extract all the tables: paper.pdf"

**Actions taken:**
1. Convert paper.pdf using docling
2. Identify 4 tables across 12 pages
3. Export each table as CSV

**Output:**
```
Parsed paper.pdf (12 pages)

Document structure:
  - Title: "Machine Learning Approaches for Climate Prediction"
  - Sections: Abstract, Introduction, Methods, Results, Discussion, References
  - Tables found: 4
  - Figures found: 6

Tables extracted:
  1. table_1.csv - "Dataset Characteristics" (5 cols, 8 rows) - Page 4
  2. table_2.csv - "Model Hyperparameters" (4 cols, 12 rows) - Page 6
  3. table_3.csv - "Performance Comparison" (6 cols, 5 rows) - Page 8
  4. table_4.csv - "Ablation Study Results" (5 cols, 7 rows) - Page 9

All tables saved to current directory.
```

### Example 2: Convert a financial report to Markdown

**User request:** "Convert this quarterly report to Markdown so I can edit it: Q3-report.pdf"

**Actions taken:**
1. Parse Q3-report.pdf with docling (handles multi-column layout)
2. Export as clean Markdown preserving structure

**Output:**
```
Converted Q3-report.pdf to Markdown

Document details:
  - Pages: 24
  - Layout: Multi-column (2-column on pages 3-20)
  - Tables: 8 (all converted to Markdown tables)
  - Figures: 5 (referenced with captions)
  - Sections: 12 headings detected

Output saved to: Q3-report.md (14,200 words)

The multi-column layout has been linearized into single-column reading order.
All tables are preserved as Markdown tables.
```

### Example 3: Extract structured data from an invoice

**User request:** "Parse this invoice and give me the line items as JSON"

**Actions taken:**
1. Parse invoice.pdf with docling
2. Identify the main line items table
3. Export as structured JSON

**Output:**
```json
{
  "invoice_number": "INV-2024-0847",
  "date": "2024-11-15",
  "vendor": "Acme Supplies Inc.",
  "line_items": [
    {"item": "Office Chairs", "qty": 10, "unit_price": 299.99, "total": 2999.90},
    {"item": "Standing Desks", "qty": 5, "unit_price": 549.00, "total": 2745.00},
    {"item": "Monitor Arms", "qty": 15, "unit_price": 89.50, "total": 1342.50}
  ],
  "subtotal": 7087.40,
  "tax": 637.87,
  "total": 7725.27
}
```

## Guidelines

- Docling handles complex layouts automatically including multi-column text, nested tables, and mixed content. Let it do the heavy lifting.
- For very large documents (200+ pages), process in sections to manage memory.
- When tables have merged cells or irregular structures, validate the DataFrame output and flag any parsing anomalies.
- Prefer Markdown export for human-readable output and JSON/dict export for programmatic use.
- If docling fails to install or parse a specific format, fall back to pdfplumber for PDFs or python-docx for DOCX files.
- Always report the document structure (sections, tables, figures found) before detailed output so the user knows what is available.
- For scanned documents without a text layer, docling may use its built-in OCR. If quality is poor, suggest the pdf-ocr skill for better preprocessing.