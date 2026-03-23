# Pipeline Attribution Narrator

> Transform raw campaign data into attribution models and decision-ready narratives.
> Built for demand gen leaders who own a pipeline number and need to explain what's
> working, what isn't, and where to reallocate.

## Why This Skill Exists

Most marketing teams can pull campaign data. Few can answer the questions leadership
actually asks:

- "Why did pipeline drop 18% this month?"
- "Should we increase the ABM budget or double down on paid search?"
- "What's the CAC payback period by segment?"
- "If we cut channel X, what happens to pipeline next quarter?"

The gap isn't data access. It's the translation layer between raw numbers and decisions.
Attribution models produce tables. Leadership needs narratives. This skill builds both.

## When to Use This Skill

- Building or selecting a pipeline attribution model
- Preparing a monthly pipeline report for CEO/VP/board
- Diagnosing why pipeline missed target in a given period
- Modeling budget reallocation scenarios (shift $X from channel A to channel B)
- Comparing channel efficiency across geos or segments
- Translating attribution data into stakeholder-ready narratives
- Evaluating whether your attribution approach needs to change
- Preparing for quarterly business reviews

## When NOT to Use This Skill

- Lead scoring or MQL definitions (different problem, different skill)
- Campaign creative optimization (use a CRO or ad creative skill)
- Real-time bidding or media buying decisions (too operational for this skill)
- Attribution platform setup/configuration (this is strategic, not technical)
- Single-channel performance analysis (this skill is cross-channel by design)

---

## Attribution Model Selection

### The Models

No model is "correct." Each answers a different question. Pick based on what decision
you need to make, not what feels most sophisticated.

| Model | How It Works | Best For | Worst For |
|-------|-------------|----------|-----------|
| **First Touch** | 100% credit to the first interaction | Answering "what fills the top of funnel?" | Understanding what closes deals |
| **Last Touch** | 100% credit to the final interaction before conversion | Answering "what triggers the conversion?" | Understanding what builds awareness |
| **Linear** | Equal credit to every touchpoint | Getting a balanced view when you have no hypothesis | Making reallocation decisions (everything looks equal) |
| **Time Decay** | More credit to touches closer to conversion | Understanding acceleration and late-stage influence | Evaluating brand and awareness investments |
| **W-Shaped** | 40% first touch, 20% middle touches, 40% opportunity creation touch | B2B SaaS with defined MQL-to-SQL handoff | Short sales cycles or single-touch conversions |
| **Full Path** | 22.5% first touch, 22.5% lead creation, 22.5% opportunity creation, 22.5% close, 10% middle | Enterprise B2B with long multi-touch cycles | Companies without clean stage data in CRM |
| **Custom/Weighted** | You define weights per stage based on your data | Mature teams with enough data to validate weights | Teams just starting attribution (overengineered) |

### Decision Framework: Which Model to Use

```
START HERE
    │
    ├─ "We have no attribution model today"
    │     → Start with Last Touch. It's wrong but useful.
    │       You'll see what closes. Run for 60 days, then layer First Touch
    │       alongside it. The delta between first and last touch tells you
    │       where your funnel has blind spots.
    │
    ├─ "We need to justify our budget to leadership"
    │     → Use W-Shaped or Full Path.
    │       These show marketing's influence across the full journey.
    │       Present alongside a Last Touch view so leadership sees both
    │       the conservative and full-influence picture.
    │
    ├─ "We need to reallocate budget between channels"
    │     → Run First Touch + Last Touch + Time Decay side by side.
    │       If a channel scores high on first touch but low on last touch,
    │       it's an awareness channel. Don't cut it because it doesn't close.
    │       If a channel scores high on last touch but low on first touch,
    │       it's a conversion channel. Don't scale it expecting more top-of-funnel.
    │
    ├─ "We need to compare performance across geos"
    │     → Use the same model for both geos. Model consistency matters more
    │       than model sophistication when comparing across segments.
    │
    └─ "Leadership wants a single number per channel"
          → Give them Last Touch with a footnote. Then show the multi-touch
            view in the appendix. Train them over time to ask better questions.
```

### Attribution Model Maturity Levels

Don't jump to advanced models without the data infrastructure to support them.

| Level | You Have | Recommended Model | Next Step |
|-------|---------|-------------------|-----------|
| **1. Starter** | UTM tracking, basic CRM data, no multi-touch visibility | Last Touch | Implement first-touch capture. Ensure UTMs are consistent. |
| **2. Foundation** | First touch + last touch data, defined funnel stages | First + Last Touch comparison | Add middle-touch tracking. Define MQL/SQL/SQO criteria clearly. |
| **3. Operational** | Full touchpoint data, clean stage transitions, 2+ quarters of data | W-Shaped or Time Decay | Build channel-level CAC calculations. Start modeling scenarios. |
| **4. Advanced** | Statistical significance in channel data, defined payback periods, cohort tracking | Full Path or Custom Weighted | Run incrementality tests. Build predictive models for budget allocation. |

---

## Core Metrics Framework

### The Metrics That Matter

These are the metrics leadership cares about, in order of strategic importance.
Everything else is a supporting input.

**Tier 1: Decision metrics** (these drive budget and strategy conversations)

| Metric | Definition | Why It Matters |
|--------|-----------|----------------|
| **CAC Payback Period** | Months until a customer's gross margin repays their acquisition cost | The single best metric for evaluating marketing efficiency. Combines CAC, ACV, and margin into one number. |
| **Pipeline-to-Spend Ratio** | Total pipeline generated / total marketing spend | Quick health check. B2B SaaS benchmark: 5:1 to 10:1 depending on ACV. |
| **Blended CAC** | Total sales + marketing cost / new customers acquired | The number your CFO cares about. Must include sales cost, not just marketing. |
| **Marketing-Sourced Pipeline %** | Pipeline from marketing-sourced opportunities / total pipeline | Shows marketing's contribution to revenue. Target: 40-60% for most B2B SaaS. |
| **Channel CAC** | Channel spend / customers acquired via that channel | Enables reallocation. Compare across channels to find efficiency gaps. |

**Tier 2: Diagnostic metrics** (these explain why Tier 1 metrics moved)

| Metric | Definition | When to Use |
|--------|-----------|-------------|
| **Cost per SQO** | Channel spend / sales qualified opportunities generated | When pipeline volume is fine but CAC is high (deal quality issue) |
| **Stage Conversion Rates** | MQL→SQL, SQL→SQO, SQO→Closed Won | When pipeline generation is fine but revenue is low (funnel leak) |
| **Pipeline Velocity** | (# opportunities × win rate × avg deal size) / sales cycle length | When you need a single forward-looking pipeline health metric |
| **Time to Pipeline** | Days from first marketing touch to SQO creation | When evaluating whether a channel builds pipeline fast or slow |
| **Influenced vs. Sourced** | Marketing touched the deal (influenced) vs. created the deal (sourced) | When justifying marketing budget. Always present both, but sourced is harder to argue with. |

**Tier 3: Operational metrics** (for day-to-day optimization, not leadership reporting)

| Metric | Examples |
|--------|---------|
| Channel-level | CPC, CPM, CTR, impression share, quality score |
| Content-level | Page views, time on page, content-assisted conversions |
| Email-level | Open rate, click rate, unsubscribe rate |
| Form-level | Submission rate, abandonment rate, field-level dropoff |

**Rule: Never present Tier 3 metrics to leadership without tying them to a Tier 1 or Tier 2 insight.** "CTR increased 15%" is noise. "CTR increase drove 12 additional SQOs at $2,400 cost per SQO" is signal.

---

## Narrative Generation

### The Anatomy of a Pipeline Narrative

Every pipeline narrative should answer five questions, in this order:

1. **Did we hit the number?** (vs. target, vs. prior period)
2. **What drove the result?** (top 2-3 contributors or detractors)
3. **What changed vs. last period?** (delta analysis, not just current snapshot)
4. **What should we do about it?** (specific reallocation or optimization recommendation)
5. **What's the forward view?** (next period projection based on current trajectory)

### Narrative Templates

#### Monthly Pipeline Report (for CEO/VP)

```
PIPELINE SUMMARY: [Month] [Year]

Target: [X] SQOs / $[Y] pipeline
Actual: [X] SQOs / $[Y] pipeline
Result: [Hit/Miss by X% or X SQOs]

[One sentence on overall result. Lead with the headline, not the buildup.]

WHAT DROVE THE RESULT

[Channel 1] contributed [X] SQOs at $[Y] cost per SQO, [up/down Z%] from prior month.
[Reason for change in 1 sentence.]

[Channel 2] contributed [X] SQOs at $[Y] cost per SQO, [up/down Z%] from prior month.
[Reason for change in 1 sentence.]

[If applicable] [Segment/geo] underperformed by [X SQOs] due to [specific reason].

WHAT CHANGED

[The single most important shift vs. prior period. Not a list of everything that moved.
One sentence identifying the change, one sentence on why it matters.]

RECOMMENDATION

[Specific action. Not "continue monitoring" or "optimize further." A concrete reallocation,
budget shift, or experiment to run, with expected impact.]

FORWARD VIEW

Based on current trajectory, [next month] is tracking toward [X] SQOs.
[One sentence on the primary risk or upside to this projection.]
```

#### Pipeline Miss Diagnosis

```
PIPELINE MISS: [Month] [Year]

Miss: [X] SQOs below target ([Y]% shortfall)

PRIMARY CAUSE
[Single biggest driver. Be specific: which channel, segment, or motion underperformed.
Not "multiple factors contributed." Pick the one that explains the most variance.]

CONTRIBUTING FACTORS
[1-2 secondary factors, each in one sentence.]

ROOT CAUSE ANALYSIS
[Is this structural (wrong channel mix), cyclical (seasonal pattern), operational
(something broke), or external (market shift)? Name it explicitly.]

RECOVERY PLAN
[What specific action will close the gap. Timeline, expected SQO impact, owner.]

WHAT THIS CHANGES ABOUT OUR MODEL
[Does the miss change any assumptions in the forecast? If so, restate the updated
assumption and its impact on the quarterly number.]
```

#### Budget Reallocation Scenario

```
SCENARIO: [Shift $X from Channel A to Channel B]

CURRENT STATE
- Channel A: $[spend] → [X] SQOs → $[Y] cost per SQO → $[Z] pipeline
- Channel B: $[spend] → [X] SQOs → $[Y] cost per SQO → $[Z] pipeline

PROPOSED CHANGE
- Channel A: Reduce by $[X] (from $[current] to $[new])
- Channel B: Increase by $[X] (from $[current] to $[new])

EXPECTED IMPACT
- Channel A: Expected SQO loss of [X] (assumes linear scaling, which may overestimate
  impact if spend is past the point of diminishing returns)
- Channel B: Expected SQO gain of [X] (assumes current efficiency holds at higher spend,
  which may not be true above $[threshold])
- Net pipeline impact: [+/- X SQOs], [+/- $Y pipeline]

ASSUMPTIONS AND RISKS
- [List the 2-3 assumptions this scenario depends on]
- [Note the biggest risk: e.g., "Channel B may hit saturation at $X spend"]
- [Time lag: "Channel B pipeline impact won't be visible for [X] weeks"]

RECOMMENDATION
[Go / No-go / Run as a 30-day test with decision criteria]
```

#### Quarterly Board Deck Narrative

```
MARKETING PIPELINE CONTRIBUTION: Q[X] [Year]

HEADLINE
[One sentence. Example: "Marketing generated $X.XM in pipeline at $X,XXX blended CAC,
with mid-market ABM emerging as the highest-efficiency motion."]

BY THE NUMBERS
- Total pipeline generated: $[X]
- Marketing-sourced: [X]% of total pipeline
- Blended CAC: $[X] ([up/down X%] vs. prior quarter)
- CAC payback period: [X] months ([segment breakdown if relevant])
- Pipeline-to-spend ratio: [X]:1

WHAT WORKED
[Top 1-2 motions that drove disproportionate results. Quantify each.]

WHAT DIDN'T
[Be honest. Name the underperforming motion and what you're doing about it.
Boards respect transparency on misses more than spin on hits.]

NEXT QUARTER PLAN
[The 1-2 strategic bets for next quarter. Not a list of everything marketing is doing.
The bets that will move the number.]

ASK
[If you need budget, headcount, or exec support, state it explicitly with the
expected ROI. Example: "$110K ABM investment expected to generate 30 additional
SQOs at $20K ACV, with pipeline visible in Q+1."]
```

---

## Geo and Segment Splits

### Reporting Across Multiple Geos

When demand gen spans multiple geographies, attribution gets messy. These rules help.

**Rule 1: Same model, same definitions, every geo.** If NAEU uses W-shaped attribution
and APAC uses last-touch, you can't compare them. Standardize the model first, even
if it means one geo's numbers look worse temporarily.

**Rule 2: Normalize by cost per SQO, not by SQO volume.** Different geos have different
market sizes. Comparing raw SQO counts is misleading. Cost per SQO reveals relative
efficiency.

**Rule 3: Report currency-adjusted numbers.** If you run budgets in multiple currencies,
pick one reporting currency and apply consistent exchange rates. Note the rate used.

**Rule 4: Separate established vs. emerging motions.** A mature demand gen engine in
one geo shouldn't be compared 1:1 against a new ABM pilot in another. Report them
in separate sections with different benchmarks.

### Reporting Across Segments

**Rule 1: Track pipeline and CAC by segment independently.** Blended numbers hide the
real story. A low blended CAC can mask an expensive mid-market motion subsidized by
cheap SMB leads.

**Rule 2: Weight by revenue, not by volume.** 10 SMB deals at $7K ACV and 3 mid-market
deals at $20K ACV produce similar revenue. But pipeline reports that count deals make
the SMB motion look 3x more productive.

**Rule 3: Use CAC payback, not CAC, as the comparison metric.** A channel with $5,000
CAC and $20K ACV (3-month payback) is better than a channel with $2,000 CAC and $7K
ACV (3.4-month payback). Raw CAC comparisons mislead when ACV varies across segments.

---

## Common Attribution Mistakes

### Mistakes That Lead to Bad Decisions

| Mistake | What Happens | How to Avoid |
|---------|-------------|--------------|
| **Reporting MQLs as pipeline** | Leadership thinks pipeline is strong, then revenue misses | Only report pipeline at SQO stage or later. MQLs are an operational metric. |
| **Counting influenced pipeline as sourced** | Marketing claims credit for deals sales would have closed anyway | Always report sourced and influenced separately. Lead with sourced. |
| **Changing attribution models mid-quarter** | Trend data becomes meaningless, you can't compare periods | Lock the model for at least 2 quarters. Run new models in parallel before switching. |
| **Attributing to last campaign, not last meaningful touch** | A newsletter open gets credit when the demo request came from a Google ad | Define what counts as a "meaningful" touch. Passive touches (email opens, page views) shouldn't carry equal weight. |
| **Ignoring time lag** | You cut a channel and pipeline drops 60 days later because the lagging effect wasn't visible | Map time-to-pipeline by channel. Content and SEO have 60-180 day lags. Paid can be 14-30 days. |
| **Optimizing for cost per lead instead of cost per SQO** | You scale cheap lead sources that never convert to pipeline | Always track conversion rates from lead through to SQO. A $50 lead with 1% SQO rate costs $5,000 per SQO. |
| **Not accounting for sales cycle in CAC payback** | You think a channel pays back in 6 months but it's actually 11 because deals take 5 months to close | CAC payback = CAC / (ACV × gross margin / 12). But add average sales cycle length to get the real time-to-payback. |

---

## Validation Checklist

Run this before presenting any attribution analysis or pipeline narrative.

### Data Quality
- [ ] UTM parameters are consistent and complete for all channels
- [ ] First touch and last touch are captured in CRM for all opportunities
- [ ] Funnel stages (MQL, SQL, SQO, Closed Won) have clear definitions
- [ ] Stage transition dates are populated (not just current stage)
- [ ] Spend data is current and matches actual invoices/platform data
- [ ] Duplicate leads/contacts have been merged

### Model Integrity
- [ ] The attribution model is explicitly stated (not implied or mixed)
- [ ] The same model is applied consistently across all channels and geos
- [ ] The model hasn't changed since last reporting period (or change is documented)
- [ ] Pipeline is counted at SQO stage or later (not MQL or SQL)
- [ ] Influenced and sourced pipeline are reported separately

### Narrative Quality
- [ ] Report leads with the headline (hit/miss), not a buildup
- [ ] Top-line metrics use Tier 1 metrics, not Tier 3
- [ ] Every metric is compared to target AND prior period
- [ ] Recommendations are specific actions, not "continue to optimize"
- [ ] Assumptions underlying any scenario are stated explicitly
- [ ] Time lags are acknowledged for channels with delayed pipeline impact
- [ ] Forward view includes the primary risk to the projection

### Stakeholder Readiness
- [ ] No jargon that the audience won't understand (match the audience)
- [ ] Currency and time period are stated explicitly
- [ ] Charts have clear labels and don't require explanation
- [ ] The "ask" (if any) is stated with expected ROI
- [ ] Appendix includes the detailed data for anyone who wants to dig deeper

---

## Integration Notes

### With Other Skills
- **GRC Messaging Guardrails:** If your pipeline narrative includes compliance framework references (e.g., "SOC 2 pipeline grew 40%"), validate terminology
- **ABM Program Orchestrator (coming):** ABM attribution requires account-level pipeline tracking, not just lead-level. This skill's segment split guidance applies
- **Product Context Template:** Upload your funnel definitions, channel mix, and segment ACVs alongside this skill for personalized output

### With Your Tech Stack
- **HubSpot:** Use Campaign object for attribution. Map deal stages to the funnel stages in this skill. Use "Original Source" for first touch and "Recent Conversion" for last touch
- **Google Analytics 4:** GA4 data-driven attribution can supplement but not replace CRM-based attribution. GA4 doesn't see what happens after form submission
- **Attribution platforms (e.g., Bizible, HockeyStack, Dreamdata):** These tools implement multi-touch models. This skill helps you interpret and narrate their output, not replace them

---

## Changelog

- **v1.0** (March 2026): Initial release. Model selection framework, core metrics, narrative templates, geo/segment splits, common mistakes, validation checklist.
