# Excel Formulas & Spreadsheets

Help users create, debug, and optimize Excel formulas and spreadsheet workflows.

## When to Use
- User needs help writing or debugging Excel formulas
- Creating pivot tables, charts, or dashboards
- Conditional formatting rules
- Data cleanup and transformation
- Building Excel macros or VBA scripts
- Converting between Excel and other formats

## When NOT to Use
- Google Sheets-specific features (use google-sheets skill)
- Database queries (use SQL tools)
- Statistical analysis requiring R/Python (use data science tools)

## Step-by-Step Instructions

### 1. Understand the Data Layout
Ask the user:
- What columns/rows do they have?
- What is the expected output?
- Are there multiple sheets involved?

### 2. Write the Formula
Always explain what each part does. Prefer modern functions when available.

### Common Formula Patterns

#### Lookup & Reference
```
=VLOOKUP(lookup_value, table_array, col_index, FALSE)
=XLOOKUP(lookup_value, lookup_array, return_array, "Not Found")
=INDEX(array, MATCH(lookup_value, lookup_range, 0))
```

**When to use which:**
- XLOOKUP: Modern Excel (Microsoft 365). Preferred — can look left, returns exact match by default
- VLOOKUP: Legacy compatibility. Only looks right. Always use FALSE for exact match
- INDEX/MATCH: Works everywhere, most flexible, can look in any direction

#### Conditional Calculations
```
=SUMIF(range, criteria, sum_range)
=SUMIFS(sum_range, criteria_range1, criteria1, criteria_range2, criteria2)
=COUNTIF(range, criteria)
=AVERAGEIF(range, criteria, average_range)
```

#### Text Functions
```
=TRIM(A1)                          -- Remove extra spaces
=PROPER(A1)                        -- Title Case
=LEFT(A1, 5)                       -- First 5 characters
=TEXTJOIN(", ", TRUE, A1:A10)      -- Join with comma
=SUBSTITUTE(A1, "old", "new")      -- Replace text
```

#### Date Functions
```
=TODAY()                           -- Current date
=DATEDIF(start, end, "M")         -- Months between dates
=EOMONTH(A1, 0)                   -- End of month
=NETWORKDAYS(start, end)          -- Working days between
=TEXT(A1, "MMMM DD, YYYY")        -- Format date as text
```

#### Data Validation
```
=IFERROR(formula, "Error message")
=IF(AND(A1>0, A1<100), "Valid", "Invalid")
=ISBLANK(A1)
```

### Pivot Table Setup
1. Select your data range (include headers)
2. Insert → Pivot Table
3. Drag fields:
   - **Rows:** Categories you want to group by
   - **Columns:** Secondary grouping (optional)
   - **Values:** Numbers to summarize (Sum, Count, Average)
   - **Filters:** Fields to filter the entire table

### Conditional Formatting Rules
Common patterns:
- Highlight cells > value: Home → Conditional Formatting → Highlight Cell Rules
- Color scales for ranges: Home → Conditional Formatting → Color Scales
- Data bars for visual comparison: Home → Conditional Formatting → Data Bars
- Custom formula: =AND($B2>1000, $C2="Complete") → apply green fill

### Chart Best Practices
- **Bar/Column:** Comparing categories
- **Line:** Trends over time
- **Pie:** Parts of a whole (use sparingly, max 6 slices)
- **Scatter:** Relationships between two variables
- Always add: title, axis labels, data labels where helpful

### VBA Macro Basics
```vba
Sub FormatReport()
    ' Select data range
    Dim ws As Worksheet
    Set ws = ActiveSheet
    
    ' Auto-fit columns
    ws.Cells.EntireColumn.AutoFit
    
    ' Bold headers
    ws.Range("A1:Z1").Font.Bold = True
    
    ' Add borders
    ws.UsedRange.Borders.LineStyle = xlContinuous
    
    MsgBox "Report formatted!"
End Sub
```

## Common Mistakes to Avoid
- Using VLOOKUP without FALSE (exact match) — gets wrong results
- Circular references — formula refers to its own cell
- Not anchoring references with $ (e.g., $A$1) when copying formulas
- Mixing data types in a column (numbers stored as text)
- Not using tables (Ctrl+T) — makes formulas auto-expand

## Templates

### Monthly Budget Tracker
| Category | Budget | Actual | Variance | Status |
|----------|--------|--------|----------|--------|
| Rent | 2000 | =actual | =Budget-Actual | =IF(D2>0,"Under","Over") |

### Sales Report
| Rep | Q1 | Q2 | Q3 | Q4 | Total | % of Target |
|-----|----|----|----|----|-------|-------------|
| Name | amt | amt | amt | amt | =SUM(B2:E2) | =F2/$G$1 |

