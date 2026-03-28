# Google Sheets

Help users work effectively with Google Sheets, including formulas, automation, and collaboration.

## When to Use
- Google Sheets-specific formulas and features
- Apps Script automation
- Shared/collaborative spreadsheets
- Importing data between sheets (IMPORTRANGE)
- Google Forms integration
- Data validation and protection

## When NOT to Use
- Microsoft Excel-specific features like VBA macros (use excel-formulas)
- Complex data analysis requiring Python/R

## Key Formulas (Google Sheets Specific)

### IMPORTRANGE — Pull Data Between Spreadsheets
```
=IMPORTRANGE("spreadsheet_url", "Sheet1!A1:D100")
```
- First time: click the cell and "Allow access"
- Wrap in IFERROR for clean errors: =IFERROR(IMPORTRANGE(...), "Loading...")

### QUERY — SQL-like Data Filtering
```
=QUERY(A1:D100, "SELECT A, B, SUM(D) WHERE C = 'Active' GROUP BY A, B ORDER BY SUM(D) DESC", 1)
```
- Column references: A, B, C (based on position in data range)
- Header row count is the last parameter
- Supports: SELECT, WHERE, GROUP BY, ORDER BY, PIVOT, LIMIT

### ARRAYFORMULA — Apply Formula to Entire Column
```
=ARRAYFORMULA(IF(A2:A<>"", A2:A * B2:B, ""))
```
- One formula handles the whole column
- Wrap in IF to avoid filling blank rows

### FILTER — Dynamic Filtered Results
```
=FILTER(A2:C100, B2:B100 = "Active", C2:C100 > 1000)
```
- Multiple conditions separated by commas (AND logic)
- For OR logic: use + between conditions

### Google-Specific Functions
```
=GOOGLEFINANCE("GOOG", "price")                    -- Stock price
=GOOGLETRANSLATE(A1, "en", "es")                   -- Translate text
=IMAGE("https://example.com/logo.png")             -- Display image in cell
=IMPORTHTML(url, "table", 1)                        -- Import HTML tables
=IMPORTXML(url, "//h1")                             -- Import XML/HTML elements
=IMPORTDATA("https://example.com/data.csv")        -- Import CSV
```

### Data Validation
- Data → Data Validation
- Types: List of items, number range, date range, custom formula
- Custom formula example: =ISEMAILADDRESS(A1)
- Show warning vs. reject input

### Conditional Formatting
- Format → Conditional Formatting
- Custom formula examples:
  - Row highlight when status = Done: =$C2="Done"
  - Overdue dates: =AND(A2<TODAY(), A2<>"")

## Apps Script Automation

### Open Script Editor
Extensions → Apps Script

### Common Scripts

**Send Email on Form Submit:**
```javascript
function onFormSubmit(e) {
  const name = e.values[1];
  const email = e.values[2];
  
  GmailApp.sendEmail(email, "Thanks for submitting!", 
    "Hi " + name + ", we received your submission.");
}
// Set trigger: Edit → Triggers → onFormSubmit → From spreadsheet → On form submit
```

**Auto-Archive Old Rows:**
```javascript
function archiveOldRows() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const source = ss.getSheetByName("Active");
  const archive = ss.getSheetByName("Archive");
  const data = source.getDataRange().getValues();
  
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][3] instanceof Date && data[i][3] < cutoff) {
      archive.appendRow(data[i]);
      source.deleteRow(i + 1);
    }
  }
}
```

**Custom Menu:**
```javascript
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('My Tools')
    .addItem('Generate Report', 'generateReport')
    .addItem('Send Reminders', 'sendReminders')
    .addToUi();
}
```

## Collaboration Features
- **Share:** Share button → add people or get link
- **Permissions:** Viewer, Commenter, Editor
- **Protected ranges:** Data → Protected Sheets and Ranges (lock cells from editing)
- **Named ranges:** Data → Named Ranges (easier formula references)
- **Filter views:** Data → Filter Views (personal filters that don't affect others)
- **Version history:** File → Version History → See Version History

## Common Mistakes to Avoid
- Not using ARRAYFORMULA (copying formulas down thousands of rows)
- IMPORTRANGE without allowing access (shows #REF! error)
- Volatile functions slowing sheets (NOW(), RAND() recalculate constantly)
- Not using Filter Views in shared sheets (regular filters affect everyone)
- Exceeding 10 million cell limit

