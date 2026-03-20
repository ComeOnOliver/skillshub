---
name: competitive-feature-benchmark
description: >
  Research and compare how competing products implement a similar feature
  at the UX and interaction level. Provides structured comparison tables
  and strategic differentiation recommendations.
license: MIT
compatibility:
  - Claude Code
  - Cursor
metadata:
  type: execution
  category: research
  maturity: draft
  estimated_time: 15 min
---

# Skill: Competitive Feature Benchmark (UX & Interaction Level)

**Type:** Execution

## Purpose

Research and analyze how competing products implement a similar feature.
Provide structured comparison and strategic recommendations.

The goal is not imitation.
The goal is to:

- Understand design patterns
- Identify strengths and weaknesses
- Detect scalable approaches
- Define differentiation strategy

---

## When to Use

- Before designing a new feature to understand industry landscape
- When deciding UX direction and needing evidence-based justification
- When evaluating whether a proposed design aligns with or diverges from market norms
- When building a differentiation strategy against known competitors

---

## When NOT to Use

- Technology stack or pricing comparisons (not UX/interaction level)
- Internal A/B test result analysis
- Features where competitive analysis is already completed and documented
- Pure visual/branding comparisons without interaction analysis

---

## Inputs Required

Do not run this skill without:

- [ ] Feature being evaluated (name and scope)
- [ ] Our current implementation or design proposal

Optional but recommended:

- [ ] Target user segment
- [ ] Industry / domain context
- [ ] Specific competitor list (if not provided, 3–5 will be identified)

---

## Output Format

1. Competitor Overview
2. Feature Comparison Table
3. Pattern Analysis
4. Strategic Recommendation
5. Differentiation Opportunities

---

## Procedure

### Step 1 – Competitor Identification

Select 3–5 competitors based on:

- Market relevance
- Similar complexity level
- Similar user persona
- Similar data scale

For each competitor:

- Product name
- Target audience
- Product maturity (early / growth / enterprise)

---

### Step 2 – Feature Breakdown per Competitor

> **EFFICIENCY RULE:** When analyzing multiple competitors, batch
> independent web searches in parallel where possible. Collect all
> competitor data before proceeding to Step 3, rather than completing
> full analysis of one competitor before starting the next.

For each competitor, analyze:

#### A. Information Architecture

- Is the feature flat or hierarchical?
- How is grouping handled?
- Is context preserved?

#### B. Navigation & Interaction

- Click depth
- Use of dropdowns, tree views, tabs, filters
- Progressive disclosure usage

#### C. Scalability Handling

- Behavior with large datasets
- Search / filter / sorting strategy
- Lazy loading or pagination

#### D. Power-user Support

- Bulk actions
- Keyboard shortcuts
- Customization

#### E. Edge Case Handling

- Empty state
- Permission-based visibility
- Long labels
- Deep nesting

---

> **CONTEXT MANAGEMENT:** After completing Step 2, compile findings
> into the comparison table immediately (Step 3). Use only the
> structured table — not the raw research notes — as input for
> Steps 4 and 5. This prevents context accumulation from verbose
> research outputs.

### Step 3 – Comparative Table (Mandatory)

Create a structured comparison table including:

- Structure Type
- Navigation Model
- Scalability Strategy
- Cognitive Load
- Strengths
- Weaknesses

---

### Step 4 – Pattern Synthesis

Identify:

- Common patterns across competitors
- Outliers (unique approaches)
- Industry norms
- Anti-patterns

---

### Step 5 – Strategic Recommendation

Answer:

1. Is our proposed direction aligned with industry patterns?
2. Are we simplifying appropriately or oversimplifying?
3. Where can we differentiate?
4. What scalability risks are we ignoring?
5. Should we:
   - Match industry norm
   - Improve on a norm
   - Intentionally diverge

Provide a clear recommendation with justification.

---

## Guardrails

- Do not produce vague statements without supporting evidence.
- Do not use subjective language without explicit reasoning.
- Do not suggest blind imitation of competitor features.
- Explicitly state assumptions when competitor data is incomplete.
- If a competitor's feature cannot be fully analyzed, declare the gap.
- Do not introduce vendor-specific or project-specific assumptions.
- Comparison must remain at UX and interaction level, not implementation detail.

---

## Failure Patterns

Common bad outputs:

- Concluding "copy what competitor X does" without strategic reasoning
- Producing subjective judgments without observable evidence
- Missing the mandatory comparison table
- Listing competitors without analyzing their feature implementation
- Failing to provide a differentiation strategy
- Ignoring scalability and edge case dimensions entirely

---

## Example 1 (Minimal Context)

**Input:**

Feature: search filter in a SaaS project management tool.
Our proposal: single dropdown with predefined filter options.

**Output:**

1. Competitor Overview: Asana (growth), Monday.com (enterprise), Linear (growth)
2. Feature Comparison Table: structure type, filter model, scalability, cognitive load per competitor
3. Pattern Analysis: most competitors use combined free-text + faceted filters; single dropdown is an outlier
4. Strategic Recommendation: our approach undersimplifies; recommend adding free-text search alongside dropdown
5. Differentiation: keyboard-first filter builder for power users

---

## Example 2 (Realistic Scenario)

**Input:**

Feature: dashboard navigation for an analytics platform.
Our proposal: tab-based top navigation with 8 sections.
Target users: data analysts at mid-size companies.
Competitors: Mixpanel, Amplitude, PostHog, Metabase.

**Output:**

1. Competitor Overview: 4 competitors with maturity levels, target audiences, product positioning
2. Feature Comparison Table: hierarchical vs flat, sidebar vs top-nav, search integration, deep-link support, mobile responsiveness per competitor
3. Pattern Analysis: 3/4 competitors use sidebar navigation; tab-based is minority pattern; all support section search
4. Strategic Recommendation: 8 top-level tabs exceed cognitive load threshold (Miller's Law); recommend grouping into 4–5 categories with sub-navigation. Sidebar is industry norm but top-nav is viable if sections are reduced.
5. Differentiation: customizable dashboard pinning (no competitor offers this), keyboard navigation shortcuts

---

## Notes

**FAST MODE** (only if explicitly requested):

- Limit to 3 competitors
- Skip dimension D (Power-user Support) and E (Edge Case Handling) in Step 2
- Comparison table still mandatory

---

If competitors are not specified in the input, identify 3–5 relevant products in the same domain before proceeding.
