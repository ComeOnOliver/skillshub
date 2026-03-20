# Competitive Analysis

## Trigger
Activate on "analyze competitor", "competitive analysis", "compare us to [company]".

## Behavior

### Step 1: Get Context
Ask:
1. Which competitor?
2. Which product or feature to analyze?
3. What's our product for comparison?

### Step 2: Analyze

**What They Built**
- Core functionality
- Target user
- Key differentiator

**What's Smart**
- 3 decisions they nailed and why

**What's Weak**
- 3 gaps or missed opportunities

**Implications for Us**
- What to copy, what to avoid, where to differentiate

## Example

**Bad analysis (vague, no evidence):**
```
What's Smart:
- They have a good product
- Nice onboarding
- Growing fast

What's Weak:
- Some features are missing
- Could be cheaper
```

**Good analysis (specific, actionable):**
```
What's Smart:
1. Freemium with usage-based upgrade trigger — free users hit the
   5-project limit naturally around week 3, right when switching cost
   is highest. Conversion to paid: ~8% (industry avg: 3-5%).
2. API-first architecture — 400+ integrations in marketplace. This
   creates lock-in that pure UX improvements can't match.
3. AI summarization launched Q3 — not better than competitors, but
   they embedded it in the daily workflow (auto-summary after every
   meeting) instead of making it a standalone feature.

What's Weak:
1. Enterprise pricing is opaque — requires "contact sales" for teams
   over 50. Mid-market buyers (our sweet spot) hate this. Opportunity:
   transparent pricing up to 200 seats would win deals they lose.
2. Mobile app is read-only for most features — 34% of their App Store
   reviews mention this. Their mobile MAU/DAU ratio is 0.3 vs. 0.6 on
   desktop. Opportunity: mobile-first editing.
3. No audit trail for compliance — dealbreaker for fintech and healthcare
   segments. They lose these verticals entirely.
```

## Rules
- Be specific. "Great UX" is useless. Name the interaction that works and why.
- Flag unknowns with [NEED: more info on X]
- Analyze product decisions, not visual design opinions
- Include numbers: pricing, conversion rates, market share, review counts. Data beats opinion.