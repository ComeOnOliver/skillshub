# Code Complexity Scanner

## Overview

This skill analyzes source code to measure cyclomatic complexity, cognitive complexity, and function length. It identifies the most complex functions and files in a codebase, helping teams focus refactoring efforts on the code that's hardest to maintain and most likely to harbor bugs.

## Instructions

### Step 1: Identify Target Language and Files

Detect the primary language from file extensions and package files. Filter to source code only (exclude node_modules, vendor, dist, build, __pycache__, .git).

### Step 2: Measure Cyclomatic Complexity

For each function/method, count:
- `if`, `elif`/`else if` → +1 each
- `for`, `while`, `do-while` → +1 each
- `case` in switch (each case) → +1 each
- `catch` → +1
- `&&`, `||` in conditions → +1 each
- Ternary `?:` → +1
- Base complexity starts at 1

### Step 3: Measure Cognitive Complexity

More nuanced than cyclomatic — penalizes nesting:
- Each control flow break: +1
- Each nesting level: +1 additional per level
- Recursion: +1
- Boolean operator sequences that switch: +1

### Step 4: Identify Hotspot Files

Rank files by:
1. Maximum function complexity in the file
2. Average complexity across all functions
3. Number of functions above threshold (default: 15)
4. Total lines of code

### Step 5: Output Report

Present findings in three tiers:
- 🔴 **Critical** (complexity > 25): Must refactor — these functions are untestable
- 🟡 **Warning** (complexity 15-25): Should refactor when next modifying
- 🟢 **OK** (complexity < 15): Acceptable maintainability

## Examples

### Example 1: TypeScript Project Scan

**User prompt:**
```
Scan src/ for the most complex functions
```

**Agent output:**
```
Complexity Report — src/ (89 files scanned)

🔴 CRITICAL (complexity > 25)
  src/billing/calculator.ts
    calculateInvoiceTotal()     Cyclomatic: 34  Cognitive: 48  Lines: 180
    applyDiscountRules()        Cyclomatic: 26  Cognitive: 31  Lines: 95

  src/api/middleware/auth.ts
    validateAndRefreshToken()   Cyclomatic: 28  Cognitive: 35  Lines: 120

🟡 WARNING (complexity 15-25)
  src/workers/sync.ts
    reconcileRecords()          Cyclomatic: 19  Cognitive: 24  Lines: 88
  src/utils/validators.ts
    validateAddress()           Cyclomatic: 16  Cognitive: 18  Lines: 65

Summary:
  Files scanned: 89 | Functions analyzed: 412
  Average complexity: 6.8 | Median: 4
  Functions above threshold: 14 (3.4%)
  Recommended target: reduce critical functions below 15
```

### Example 2: Python Project with Trend

**User prompt:**
```
What are the complexity hotspots in our Django app?
```

**Agent output:**
```
Complexity Hotspots — myapp/ (67 files)

Top 10 by Cyclomatic Complexity:
  Rank  Function                              CC   Lines  File
  1     process_order()                       38   340    views/checkout.py
  2     generate_report()                     27   210    reports/builder.py
  3     sync_inventory()                      24   180    tasks/inventory.py
  4     parse_import_file()                   22   150    importers/csv.py
  5     calculate_shipping()                  19   95     shipping/rates.py

Nesting depth violations (>4 levels):
  views/checkout.py:142    — 6 levels deep in process_order()
  reports/builder.py:89    — 5 levels deep in generate_report()

Recommended refactoring order: process_order() first (highest complexity,
most changed file per git history, 340 lines is 3x recommended max).
```

## Guidelines

- **Thresholds are configurable** — default 15 works for most teams, but ask the user if they have a team standard
- **Cognitive > cyclomatic for human readability** — cognitive complexity better captures how hard code is to understand
- **Context matters** — a parser with complexity 20 might be acceptable; a controller with complexity 20 needs splitting
- **Combine with change frequency** — complex code that never changes is less urgent than complex code edited weekly
- **Don't count generated code** — exclude auto-generated files, migrations, and schema definitions
- **Suggest specific refactorings** — "Extract method" for long functions, "Replace conditional with polymorphism" for deep switch statements, "Introduce parameter object" for functions with 5+ parameters
