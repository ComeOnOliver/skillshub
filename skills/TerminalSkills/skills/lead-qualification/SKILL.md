# Lead Qualification

## Overview

Score and qualify sales leads to prioritize outreach and focus on the highest-value opportunities. This skill evaluates leads against configurable criteria such as BANT (Budget, Authority, Need, Timeline), company fit, engagement signals, and custom scoring rules. Produces ranked lead lists with scores, recommendations, and next-step suggestions.

## Instructions

When a user asks to qualify, score, or prioritize their leads, follow these steps:

### Step 1: Load the lead data

Accept leads from CSV, spreadsheet, or manual input:

```python
import pandas as pd

def load_leads(file_path):
    if file_path.endswith('.csv'):
        df = pd.read_csv(file_path)
    elif file_path.endswith('.xlsx'):
        df = pd.read_excel(file_path)
    else:
        raise ValueError("Supported formats: CSV, XLSX")
    df.columns = [col.strip().lower().replace(' ', '_') for col in df.columns]
    return df
```

Key fields to look for or request:
- Company name, industry, company size (employees or revenue)
- Contact name, title, role
- Lead source (inbound, referral, outbound, event)
- Budget information (if available)
- Current solution / competitor
- Engagement signals (website visits, content downloads, demo requests)
- Notes or qualification details

### Step 2: Select the scoring framework

**BANT Scoring** (default for most B2B):

| Criteria | Weight | Scoring |
|----------|--------|---------|
| Budget | 30% | Has budget (30), exploring (15), no budget (0) |
| Authority | 25% | Decision maker (25), influencer (15), researcher (5) |
| Need | 25% | Urgent need (25), acknowledged need (15), no clear need (5) |
| Timeline | 20% | Within 3 months (20), 3-6 months (10), 6+ months (5) |

**Company Fit Scoring** (for ICP matching):

| Criteria | Weight | Scoring |
|----------|--------|---------|
| Industry match | 25% | Target industry (25), adjacent (15), other (5) |
| Company size | 25% | Ideal range (25), close (15), outside (5) |
| Geography | 15% | Target region (15), serviceable (10), other (5) |
| Technology fit | 20% | Uses compatible stack (20), neutral (10), incompatible (0) |
| Revenue potential | 15% | High ACV (15), medium (10), low (5) |

### Step 3: Score each lead

```python
def score_lead_bant(lead):
    score = 0
    reasons = []

    # Budget (30 points)
    budget = str(lead.get('budget', '')).lower()
    if budget in ['yes', 'confirmed', 'approved']:
        score += 30
        reasons.append("Budget confirmed")
    elif budget in ['exploring', 'pending', 'maybe']:
        score += 15
        reasons.append("Budget being explored")
    else:
        reasons.append("No budget information")

    # Authority (25 points)
    title = str(lead.get('title', '')).lower()
    if any(t in title for t in ['ceo', 'cto', 'cfo', 'vp', 'director', 'head of', 'owner']):
        score += 25
        reasons.append("Decision maker")
    elif any(t in title for t in ['manager', 'lead', 'senior']):
        score += 15
        reasons.append("Influencer role")
    else:
        score += 5
        reasons.append("Researcher / early stage")

    # Need (25 points)
    need = str(lead.get('need', lead.get('pain_point', ''))).lower()
    if any(n in need for n in ['urgent', 'critical', 'immediate', 'asap']):
        score += 25
        reasons.append("Urgent need identified")
    elif need and need not in ['none', 'no', '']:
        score += 15
        reasons.append("Need acknowledged")
    else:
        score += 5
        reasons.append("Need unclear")

    # Timeline (20 points)
    timeline = str(lead.get('timeline', '')).lower()
    if any(t in timeline for t in ['now', 'this month', 'asap', '1 month', '2 month', '3 month', 'q1']):
        score += 20
        reasons.append("Near-term timeline")
    elif any(t in timeline for t in ['quarter', '6 month', 'this year']):
        score += 10
        reasons.append("Medium-term timeline")
    else:
        score += 5
        reasons.append("No clear timeline")

    return score, reasons
```

### Step 4: Classify and rank leads

Assign qualification tiers based on score:

```python
def classify_lead(score):
    if score >= 80:
        return "Hot", "Immediate follow-up - schedule a call today"
    elif score >= 60:
        return "Warm", "Priority follow-up within 48 hours"
    elif score >= 40:
        return "Nurture", "Add to nurture campaign, follow up in 1-2 weeks"
    else:
        return "Cold", "Low priority - monitor for engagement changes"
```

### Step 5: Generate the qualification report

Output a ranked list with scores, tiers, and recommended actions:

```python
def generate_report(scored_leads, output_path="qualified_leads.csv"):
    df = pd.DataFrame(scored_leads)
    df = df.sort_values('score', ascending=False)
    df.to_csv(output_path, index=False)
    return df
```

## Examples

### Example 1: Qualify a list of inbound leads

**User request:** "Score these 25 leads from our webinar sign-ups. Here's the CSV file."

**Actions taken:**
1. Load leads.csv with 25 entries
2. Apply BANT scoring based on available fields
3. Rank and classify all leads

**Output:**
```
Lead Qualification Report
=========================
Total leads scored: 25

Tier Breakdown:
  Hot (80+):     4 leads (16%) - Immediate follow-up
  Warm (60-79):  7 leads (28%) - Priority follow-up
  Nurture (40-59): 9 leads (36%) - Nurture campaign
  Cold (<40):    5 leads (20%) - Monitor

Top 5 Leads:
  Rank | Company          | Contact       | Score | Tier | Action
  1    | TechGrowth Inc   | Sarah Chen, VP| 95    | Hot  | Call today - budget confirmed, urgent need
  2    | DataFirst LLC    | Mark Jones, Dir| 90   | Hot  | Call today - decision maker, Q1 timeline
  3    | ScaleUp Corp     | Amy Park, CTO | 85    | Hot  | Call today - strong tech fit, active eval
  4    | CloudNine SaaS   | Tom Lee, Head | 80    | Hot  | Demo this week - exploring budget
  5    | GreenField Co    | Lisa Wang, Mgr| 75    | Warm | Follow up in 48h - need confirmed

Full report saved: qualified_leads.csv
```

### Example 2: Evaluate leads against ideal customer profile

**User request:** "We sell to mid-market SaaS companies (100-1000 employees) in North America. Score these leads for fit."

**Actions taken:**
1. Define ICP criteria from user description
2. Score each lead on company fit dimensions
3. Highlight best-fit and poor-fit leads

**Output:**
```
ICP Fit Analysis
================
Target Profile: Mid-market SaaS, 100-1000 employees, North America

Fit Distribution:
  Strong fit (80+):    8 leads - Match ICP on 4+ criteria
  Moderate fit (60-79): 12 leads - Match on 2-3 criteria
  Weak fit (<60):      5 leads - Poor ICP match

Strong Fit Leads:
  1. StreamLine (SaaS, 450 emp, US) - Score: 92
  2. DataPipe (SaaS, 280 emp, Canada) - Score: 88
  3. FlowMetrics (SaaS, 620 emp, US) - Score: 85

Weak Fit (consider deprioritizing):
  - MegaCorp Industries (Manufacturing, 15,000 emp) - Score: 25
  - LocalShop (Retail, 12 emp, UK) - Score: 20
```

### Example 3: Pipeline quality analysis

**User request:** "Analyze our current pipeline of 50 opportunities and tell me which ones to focus on this quarter"

**Actions taken:**
1. Load pipeline data
2. Score on BANT plus deal velocity indicators
3. Identify stalled deals and top opportunities

**Output:**
```
Pipeline Quality Analysis: Q1 2025
====================================
Total opportunities: 50
Total pipeline value: $2.4M

Quality Distribution:
  High quality (likely to close):  12 deals ($820K)
  Medium quality (needs work):     18 deals ($740K)
  Low quality (at risk):           14 deals ($580K)
  Stalled (no activity 30+ days):   6 deals ($260K)

Recommended Focus (Top 10):
  [Ranked list of 10 deals with scores and specific next steps]

Stalled Deals Requiring Attention:
  - Deal X: No contact in 45 days, re-engage or close out
  - Deal Y: Champion left company, identify new sponsor

Quarterly Forecast:
  Best case:   $820K (high quality deals)
  Likely case: $620K (weighted by probability)
  Worst case:  $380K (only committed deals)
```

## Guidelines

- Default to BANT scoring for B2B leads unless the user specifies a different framework.
- Always sort output by score descending so the best leads appear first.
- Include a specific recommended action for each lead tier, not just the score.
- When lead data is incomplete, score based on available fields and note what information is missing.
- Flag leads where the contact title suggests they are not a decision maker but the deal is otherwise strong.
- For pipeline analysis, flag stalled deals (no activity in 30+ days) as a separate category.
- Scoring weights should be configurable. Use the defaults but adjust if the user specifies different priorities.
- Never present raw scores without context. Always include the tier classification and a recommended action.
- Install pandas with `pip install pandas` if not available.
