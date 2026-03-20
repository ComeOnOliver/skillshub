# ABM Program Orchestrator

> A sequential, closed-loop system for running account-based marketing in B2B SaaS.
> Each phase produces a defined output that feeds the next. Run all 8 phases for a
> full program build, or invoke any phase individually when you need just one piece.

## Why This Skill Exists

Most ABM programs fail for three reasons:

1. **They're built as campaigns, not systems.** A "target account list" email blast
   is not ABM. ABM is a coordinated motion across marketing, BDR, and sales that
   treats accounts as markets of one.

2. **They skip the economics.** If your ABM cost per SQO is $3,667 but the ACV
   justifies it at $20K with 3-month payback, the program works. Most teams never
   run this math. They either overspend on low-ACV accounts or underspend on
   high-value targets.

3. **There's no feedback loop.** Campaign ends, team moves on, learnings evaporate.
   The next ABM cohort starts from scratch instead of building on what the last
   one taught you.

This skill fixes all three by encoding ABM as a sequential pipeline with a closed
loop. Phase 8 feeds learnings back into Phase 1. Each cohort makes the next smarter.

## When to Use This Skill

- Designing an ABM program from scratch
- Building or refining a target account list
- Setting up account tiering criteria and methodology
- Planning multi-channel orchestration for target accounts
- Coordinating BDR outreach with marketing air cover
- Defining ABM-specific measurement and attribution frameworks
- Running a quarterly ABM program review
- Making a budget case for ABM investment to leadership
- Comparing ABM economics against demand gen efficiency
- Designing account progression plays (awareness to opportunity)

## When NOT to Use This Skill

- Broad demand gen campaign planning (ABM is targeted, not broad)
- Lead scoring or MQL definitions (use your MAP's scoring model)
- Single-channel campaign execution (ABM is multi-channel by definition)
- SMB/PLG motions where 1:1 account targeting doesn't justify the CAC
- Content creation for ABM campaigns (this skill designs the program, not the assets)
- CRM or MAP technical configuration (this is strategic, not implementation)

---

## The ABM Pipeline: 8 Sequential Phases

Each phase produces a defined output. That output becomes the input for the next
phase. Skip a phase and the downstream work breaks.

```
PHASE 1              PHASE 2              PHASE 3              PHASE 4
ICP & Economics  →   Account Selection →  Account Tiering  →  Buying Committee
                                                               Mapping

     ↓                                                              ↓

PHASE 8              PHASE 7              PHASE 6              PHASE 5
Program Review   ←   Measurement &    ←   BDR Coordination ←  Channel
& Feedback           Attribution                               Orchestration

     ↓
     └──→ PHASE 1 (next cohort)
```

**The closed loop:** Phase 8 produces a learnings document that updates Phase 1
inputs. Account selection criteria sharpen. Tiering weights adjust. Channel mix
shifts. Each cohort inherits what the last one learned.

---

## Phase 1: ICP Definition & ABM Economics

**Input:** Company strategy, segment definitions, current pipeline data
**Output:** ABM ICP document + economic viability model

Before selecting a single account, prove the economics work.

### ABM Economic Viability Test

Run this before investing anything. If the math doesn't work at the unit level,
no amount of orchestration will save the program.

```
ABM ECONOMIC MODEL

Target segment ACV:          $________
Expected win rate (ABM):     ________%
Gross margin:                ________%
Average sales cycle:         ________ months
Planned ABM spend/quarter:   $________
Expected SQOs from ABM:      ________

DERIVED METRICS
Cost per SQO:                $________ (spend / SQOs)
Expected revenue per SQO:    $________ (ACV × win rate)
CAC payback period:          ________ months (cost per SQO / (ACV × margin / 12))
Pipeline-to-spend ratio:     ________:1 ((SQOs × ACV) / spend)

VIABILITY CHECK
□ CAC payback < 12 months?
□ Pipeline-to-spend ratio > 3:1?
□ Cost per SQO justified by ACV? (rule of thumb: cost per SQO < 20% of ACV)
□ Win rate assumption based on data, not aspiration?
```

### ICP for ABM (Not the Same as Your Demand Gen ICP)

Your demand gen ICP answers "who might buy." Your ABM ICP answers "who should we
invest disproportionately in acquiring." The ABM ICP is narrower and more specific.

| ABM ICP Dimension | What to Define | Example |
|-------------------|----------------|---------|
| **Company size** | Employee range AND revenue range | 100-500 employees, $10M-$100M revenue |
| **Industry vertical** | Primary + secondary verticals | SaaS, FinTech (primary); HealthTech (secondary) |
| **Compliance pressure** | Regulatory triggers that create urgency | SOC 2 audit upcoming, ISO 27001 required by enterprise customers |
| **Technology signals** | Stack indicators that show fit | Uses AWS/Azure/GCP, has a security team, runs CI/CD pipelines |
| **Buying triggers** | Events that create a buying window | New CISO hire, funding round, enterprise customer acquisition, compliance deadline |
| **Firmographic fit** | Revenue, headcount, geo, funding stage | Series B+, US/UK/ANZ HQ, 3+ person security/compliance function |
| **Negative signals** | Disqualifiers that waste ABM spend | Already using a competitor, <50 employees, no compliance requirement |

**Output format:** A 1-page ABM ICP document that any team member (marketing, BDR,
sales) can use to evaluate whether an account belongs in the ABM program. If the ICP
requires a paragraph of caveats to explain, it's too loose.

---

## Phase 2: Account Selection

**Input:** ABM ICP document (Phase 1)
**Output:** Raw target account list (50-200 accounts per cohort)

### Account Sourcing Channels

Don't build your list from a single source. Cross-reference at least 3 to reduce
noise.

| Source | What It Gives You | Watch Out For |
|--------|-------------------|---------------|
| **CRM historical data** | Accounts that engaged but didn't close (recycled pipeline) | Stale data. Validate that the account still fits the ICP. |
| **Intent data platforms** (Bombora, G2, TrustRadius) | Accounts actively researching your category | High false positive rate. Cross-reference with firmographic fit. |
| **Sales input** | Accounts sales has identified but hasn't cracked | Sales bias toward big logos that may not fit ICP. Validate against criteria. |
| **Competitor displacement** | Accounts using a competitor whose contract is up for renewal | Hard to get accurate data. Best sourced from G2 reviews + sales intel. |
| **Expansion signals** | Existing customers with upsell/cross-sell potential | Different motion. Don't mix acquisition ABM with expansion ABM in the same cohort. |
| **LinkedIn Sales Navigator** | Filtered by company size, industry, growth signals | Good for enrichment, weak as a primary sourcing channel. |
| **Industry events and communities** | Accounts attending relevant conferences, active in Slack groups | Low volume but high signal. Good for Tier 1 enrichment. |

### Account Qualification Scorecard

Score every account before adding it to the list. This prevents the "big logo bias"
where accounts are selected because they'd look good on the website, not because
they'd actually buy.

| Criterion | Weight | Score (1-5) | Notes |
|-----------|--------|-------------|-------|
| **ICP firmographic fit** | 25% | | Company size, industry, geo, funding |
| **Buying trigger present** | 25% | | Active compliance need, recent hire, funding event |
| **Intent signals** | 20% | | Category research, competitor evaluation, content engagement |
| **Sales alignment** | 15% | | Sales agrees this is a viable target and will work it |
| **Competitive displacement opportunity** | 15% | | Using a competitor, contract renewal timing known |
| **TOTAL** | 100% | | Minimum threshold: 3.0 to enter ABM list |

Accounts scoring below 3.0 go into demand gen nurture, not ABM. ABM spend on
low-fit accounts is the single most common budget waste.

---

## Phase 3: Account Tiering

**Input:** Qualified account list (Phase 2)
**Output:** Tiered account list with resource allocation per tier

### The Three-Tier Model

| Tier | # of Accounts | Resource Level | Motion Type | Typical Spend/Account/Quarter |
|------|--------------|----------------|-------------|-------------------------------|
| **Tier 1** | 10-25 | High touch, 1:1 | Personalized outreach, custom content, executive engagement, direct mail | $500-$2,000 |
| **Tier 2** | 25-75 | Medium touch, 1:few | Industry/persona-specific campaigns, targeted ads, BDR sequences | $100-$500 |
| **Tier 3** | 75-200 | Programmatic, 1:many | Targeted ads, automated nurture, intent-triggered BDR outreach | $25-$100 |

### Tiering Decision Matrix

Tier assignment is not just about account size. It's about investment justification.

```
TIERING LOGIC

Tier 1 IF:
  - ACV potential > 2× your average deal size
  - Active buying trigger confirmed
  - Sales has a named champion or entry point
  - Account is in your top vertical(s)

Tier 2 IF:
  - ACV potential > 1.5× your average deal size
  - Firmographic fit is strong but buying trigger is unconfirmed
  - No sales relationship yet but ICP fit is clear
  - Intent data shows category research

Tier 3 IF:
  - Meets ICP criteria but no active buying trigger
  - ACV potential is at or slightly above average
  - Good long-term fit but not ready for high-touch investment
  - Use as a "warming" tier to monitor for trigger events
```

### Tier Promotion and Demotion Rules

Accounts don't stay in their tier forever. Define rules for movement.

| Movement | Trigger | Action |
|----------|---------|--------|
| Tier 3 → Tier 2 | Intent spike, engagement with 3+ assets, BDR confirms interest | Increase ad spend, add to BDR active sequence, create persona-specific content |
| Tier 2 → Tier 1 | Meeting booked, champion identified, buying timeline confirmed | Assign dedicated BDR, create custom content, activate executive engagement |
| Tier 1 → Tier 2 | No engagement after 60 days of high-touch outreach | Reduce to medium-touch, reallocate budget to responsive Tier 1 accounts |
| Any tier → Remove | Company acquired, went bankrupt, confirmed competitor lock-in, ICP no longer fits | Remove from ABM list, document reason, update ICP criteria if pattern emerges |

---

## Phase 4: Buying Committee Mapping

**Input:** Tiered account list (Phase 3)
**Output:** Persona map per Tier 1 account, persona templates per Tier 2/3

### The Buying Committee for B2B SaaS (Compliance/Security Context)

In B2B SaaS selling to mid-market and enterprise, you rarely sell to one person.
Map the committee before designing outreach.

| Role | Title Examples | What They Care About | Content That Works |
|------|---------------|---------------------|-------------------|
| **Economic Buyer** | CFO, VP Finance, CEO | ROI, payback period, total cost vs. build-vs-buy | Business cases, ROI calculators, customer case studies with revenue impact |
| **Technical Evaluator** | CTO, VP Engineering, Security Engineer | Integration, architecture, technical capabilities | Technical docs, API documentation, architecture diagrams, POC/sandbox |
| **Compliance Champion** | CISO, Head of Compliance, GRC Manager | Audit readiness, framework coverage, evidence collection | Framework coverage matrices, audit prep guides, compliance workflow demos |
| **Day-to-Day User** | Compliance Analyst, Security Analyst, IT Manager | Ease of use, time savings, workflow fit | Product tours, onboarding demos, user testimonials, time-saved metrics |
| **Blocker/Gatekeeper** | Legal, Procurement, IT Security | Vendor risk, data handling, contract terms | Security questionnaire responses, SOC 2 report, privacy documentation |

### Mapping Depth by Tier

| Tier | Mapping Depth | What You Need |
|------|--------------|---------------|
| **Tier 1** | Full committee mapped by name. 3-5 contacts identified with LinkedIn profiles, roles, and preferred channels. | BDR research + LinkedIn Sales Navigator + CRM data + any existing contacts |
| **Tier 2** | Persona-level mapping. You know the roles that matter but may not have specific names for all of them. | Template-based. Map the 2-3 most important personas per account. |
| **Tier 3** | ICP-level targeting only. You target by title/role across the tier, not by individual. | Programmatic. Use LinkedIn/ad targeting by job title within the account list. |

---

## Phase 5: Channel Orchestration

**Input:** Tiered accounts with buying committee maps (Phase 3 + Phase 4)
**Output:** Channel plan per tier with sequencing and budget allocation

### Channel Selection by Tier

The right channel mix depends on the tier. Higher tiers justify more expensive,
higher-touch channels.

| Channel | Tier 1 | Tier 2 | Tier 3 | Cost Level | Notes |
|---------|--------|--------|--------|------------|-------|
| **LinkedIn Ads (Matched Audiences)** | ✓ | ✓ | ✓ | Medium | Foundation for all tiers. Upload account lists for targeting. |
| **Programmatic Display (IP targeting)** | ✓ | ✓ | ✓ | Low-Medium | Awareness layer. Cheap impressions on target accounts. |
| **Personalized BDR outreach** | ✓ | ✓ (templated) | ✗ | High (time) | Tier 1: fully custom. Tier 2: persona-templated. |
| **Custom content/landing pages** | ✓ | ✗ | ✗ | High | Only for Tier 1. Industry or account-specific content. |
| **Direct mail / gifting** | ✓ | ✗ | ✗ | High | Pattern interrupt for Tier 1 accounts that aren't responding to digital. |
| **Executive engagement** | ✓ | ✗ | ✗ | Very High (time) | Your CEO/CRO reaches out to their CEO/CISO. Reserve for top 5-10 accounts. |
| **Webinars / events (targeted invites)** | ✓ | ✓ | ✗ | Medium | Invite Tier 1-2 contacts to relevant sessions. Personalize the invite. |
| **Retargeting (website visitors)** | ✓ | ✓ | ✓ | Low | If the account visits your site, retarget aggressively with relevant content. |
| **Email nurture (automated)** | ✗ | ✓ | ✓ | Low | Tier 2-3 only. Tier 1 should get human outreach, not automated email. |
| **Content syndication (targeted)** | ✗ | ✓ | ✓ | Medium | Lead gen for Tier 2-3. Validate leads against account list before accepting. |

### Orchestration Sequencing

ABM channels work in a sequence, not in parallel. Layer them intentionally.

```
WEEK 1-2: AWARENESS LAYER
├─ LinkedIn Matched Audience ads live (all tiers)
├─ Programmatic display live (all tiers)
└─ Output: Establish brand familiarity before any outreach

WEEK 3-4: WARM-UP
├─ BDR connection requests on LinkedIn (Tier 1-2)
├─ Content engagement monitoring begins
├─ Tier 1: Custom content piece or research shared via BDR
└─ Output: Initial touchpoints, engagement signals collected

WEEK 5-8: ACTIVE ENGAGEMENT
├─ BDR outreach sequences begin (Tier 1: personalized, Tier 2: templated)
├─ Webinar/event invitations sent (Tier 1-2)
├─ Tier 1: Direct mail or gifting for non-responders
├─ Tier 3: Automated nurture activated
├─ Retargeting activated for any account showing web engagement
└─ Output: Meetings booked, engagement scored, tier promotions triggered

WEEK 9-12: CONVERSION & PROGRESSION
├─ BDR follow-up on all engaged contacts
├─ Tier 1: Executive engagement for high-value stalled accounts
├─ Tier promotion/demotion review
├─ Pipeline created from ABM tracked and attributed
└─ Output: SQOs created, pipeline dollars attributed, cohort data collected
```

### Budget Allocation Framework

| Budget Category | % of ABM Budget | Rationale |
|----------------|-----------------|-----------|
| **Paid media (LinkedIn + programmatic)** | 40-50% | The awareness and air cover layer. Necessary for all tiers. |
| **BDR time allocation** | 20-30% | The conversion engine. BDR time is expensive; protect it for Tier 1-2. |
| **Content and creative** | 10-15% | Custom assets for Tier 1, persona templates for Tier 2. |
| **Direct mail / gifting** | 5-10% | Tier 1 only. Pattern interrupt budget. |
| **Tools and platforms** | 5-10% | ABM platform, intent data, enrichment tools. |

---

## Phase 6: BDR Coordination

**Input:** Channel plan with sequencing (Phase 5)
**Output:** BDR playbook with account assignments, outreach sequences, and handoff criteria

### The ABM-BDR Operating Model

ABM without BDR coordination is just advertising. The BDR is the conversion mechanism.

**Core principle:** BDR outreach must be synchronized with marketing air cover. A BDR
calling into an account that hasn't seen any marketing touches is cold calling, not ABM.

### BDR Account Assignment

| Tier | BDR Assignment | Account Load | Outreach Cadence |
|------|---------------|--------------|------------------|
| **Tier 1** | Named BDR per account (or small group of 5-10) | 10-15 accounts per BDR | 2-3 touches per contact per week across channels |
| **Tier 2** | BDR pool covering a segment | 25-40 accounts per BDR | 1-2 touches per contact per week, templated |
| **Tier 3** | No dedicated BDR. Intent-triggered only. | N/A | BDR engages only when intent signal or engagement threshold triggers an alert |

### Outreach Sequence Design

**Tier 1 sequence (12-touch, 4-week cycle):**

| Touch | Day | Channel | Content |
|-------|-----|---------|---------|
| 1 | Day 1 | LinkedIn connect | Personalized connection request referencing a trigger event |
| 2 | Day 2 | Email | Insight-led email referencing their specific challenge (not your product) |
| 3 | Day 5 | LinkedIn engage | Comment on or share their content, or share relevant research |
| 4 | Day 7 | Email | Case study from their industry/vertical with specific outcomes |
| 5 | Day 10 | Phone | Call referencing email engagement (only if opens/clicks detected) |
| 6 | Day 12 | LinkedIn message | Share a custom piece of content relevant to their role |
| 7 | Day 15 | Email | Direct ask for a conversation with a specific value proposition |
| 8 | Day 17 | Direct mail | Physical piece (book, handwritten note, branded item) |
| 9 | Day 20 | Email | Follow up on direct mail, tie to upcoming event or deadline |
| 10 | Day 22 | LinkedIn voice note | Personal voice message (pattern interrupt) |
| 11 | Day 25 | Email | Final value-add, no ask (leave the door open) |
| 12 | Day 28 | Internal review | Score engagement, decide: continue, pause, or escalate to exec |

**Tier 2 sequence (8-touch, 3-week cycle):**

Persona-templated version of the Tier 1 sequence. Same structure, but the
personalization is at the persona level (CISO, CTO, Compliance Manager), not the
individual level.

### BDR-to-Sales Handoff Criteria

Define when an ABM-engaged account transitions from BDR-owned to sales-owned.

| Handoff Trigger | What BDR Provides at Handoff |
|-----------------|------------------------------|
| Meeting booked with qualified contact | Account brief: tier, engagement history, personas contacted, content consumed, buying trigger |
| Champion identified and validated | Champion profile: role, pain points discussed, competitive landscape, timeline indicators |
| Multiple personas engaged (2+) | Committee map update: who's engaged, who's not, recommended entry strategy for remaining personas |
| Inbound request from ABM account | Flag as ABM-sourced in CRM. Ensure attribution captures the marketing touches that preceded the inbound. |

---

## Phase 7: Measurement & Attribution

**Input:** Active ABM program data (all prior phases)
**Output:** ABM performance dashboard and attribution model

### ABM Metrics Framework

ABM metrics are different from demand gen metrics. You're measuring account
progression, not lead volume.

**Tier 1 metrics (report to leadership):**

| Metric | Definition | Target Benchmark |
|--------|-----------|-----------------|
| **Account engagement score** | Composite score: web visits + ad clicks + email engagement + BDR responses per account | Tier 1: 70%+ accounts engaged. Tier 2: 50%+. Tier 3: 30%+. |
| **Pipeline created (ABM-sourced)** | Pipeline $ from opportunities where an ABM target account created an SQO | Track separately from demand gen pipeline |
| **Pipeline influenced (ABM-influenced)** | Pipeline $ from opportunities where ABM touched the account but didn't source the opportunity | Report alongside sourced, but don't conflate them |
| **ABM cost per SQO** | Total ABM spend / SQOs created from ABM accounts | Compare against demand gen cost per SQO. Higher is acceptable if ACV justifies it. |
| **ABM CAC payback** | ABM cost per SQO / (ACV × gross margin / 12) | Must be < 12 months. Compare against demand gen CAC payback. |
| **Average deal size (ABM vs. non-ABM)** | Mean ACV of ABM-sourced deals vs. all other deals | ABM should produce 1.5-3× larger deals. If not, tiering or ICP is off. |

**Tier 2 metrics (operational, for program optimization):**

| Metric | Definition | Why It Matters |
|--------|-----------|----------------|
| **Account penetration** | # of contacts engaged per account / total contacts in buying committee | Shows whether you're reaching the full committee or just one person |
| **Tier progression rate** | % of Tier 3 accounts that moved to Tier 2, Tier 2 to Tier 1 | Measures whether your warming plays work |
| **Channel contribution to engagement** | Which channels drove the most engagement by tier | Informs next cohort's channel allocation |
| **BDR meeting rate (ABM vs. cold)** | Meeting booked rate for ABM accounts vs. non-ABM cold outreach | Should be 2-3× higher for ABM. If not, air cover isn't working. |
| **Time to SQO (ABM)** | Days from ABM program start to SQO creation | Track by tier. Tier 1 should convert faster than Tier 3. |

### Attribution Rules for ABM

ABM attribution is account-level, not lead-level. This is the critical difference
from demand gen attribution.

| Rule | Why It Matters |
|------|---------------|
| **Attribute at the account level, not the contact level.** | In ABM, marketing may engage the CISO, BDR may book a meeting with the CTO, and the deal closes with the VP Engineering. Lead-level attribution misses the full picture. |
| **Define "ABM-sourced" vs. "ABM-influenced" clearly.** | Sourced: the account's first meaningful marketing touch was an ABM campaign. Influenced: the account was in your ABM list and received ABM touches, but first contact came from another channel. |
| **Credit the program, not just the last touch.** | If LinkedIn ads warmed the account, BDR booked the meeting, and the demo closed the deal, the ABM program gets credit. Don't let last-touch attribution give all credit to the demo. |
| **Track the counterfactual.** | Compare ABM accounts' conversion rates against similar non-ABM accounts. The delta is your ABM lift. Without this, you can't prove ABM works. |
| **Separate cohorts in reporting.** | Each ABM cohort (Q1, Q2, etc.) should be reported independently. Mixing cohorts hides whether your program is improving over time. |

---

## Phase 8: Program Review & Feedback Loop

**Input:** Measurement data (Phase 7) + qualitative feedback from BDR and sales
**Output:** Cohort review document that updates Phase 1 inputs for the next cohort

This is the phase most ABM programs skip. It's also the phase that makes the
difference between a one-off campaign and a compounding system.

### Quarterly ABM Review Template

```
ABM PROGRAM REVIEW: COHORT [X], Q[X] [YEAR]

PROGRAM SUMMARY
- Cohort size: [X] accounts ([X] T1, [X] T2, [X] T3)
- Total ABM spend: $[X]
- Duration: [X] weeks

RESULTS
- Accounts engaged: [X]/[X] ([X]%)
- Meetings booked: [X]
- SQOs created: [X] ($[X] pipeline)
- Pipeline influenced: $[X]
- Cost per SQO: $[X]
- Average deal size (ABM): $[X] vs. $[X] (non-ABM)
- CAC payback period: [X] months

WHAT WORKED (evidence required, not opinions)
1. [Specific tactic/channel] → [Measurable result]
2. [Specific tactic/channel] → [Measurable result]

WHAT DIDN'T WORK (be honest)
1. [What failed] → [Why we think it failed] → [What we're changing]
2. [What failed] → [Why we think it failed] → [What we're changing]

ICP UPDATES FOR NEXT COHORT
- Add criteria: [What we learned about who buys]
- Remove criteria: [What we assumed that wasn't true]
- Adjust weighting: [Which scorecard criteria mattered more/less than expected]

TIERING ADJUSTMENTS
- Tier thresholds: [Any changes to scoring cutoffs]
- Resource allocation: [Shift budget between tiers?]

CHANNEL MIX CHANGES
- Increase: [Channels that performed above expectation]
- Decrease: [Channels that underperformed]
- Test: [New channels to try in next cohort]

BDR FEEDBACK
- Sequence effectiveness: [What BDRs report about response rates]
- Messaging: [What resonated vs. what fell flat]
- Handoff quality: [Sales feedback on ABM-sourced meetings]

NEXT COHORT PLAN
- Cohort size target: [X] accounts
- Budget: $[X]
- Key change from this cohort: [The single biggest adjustment]
- Expected SQOs: [X] (based on this cohort's conversion rates, adjusted for changes)
```

### The Compounding Effect

Track these metrics across cohorts to prove the system compounds:

| Metric | Cohort 1 | Cohort 2 | Cohort 3 | Trend |
|--------|----------|----------|----------|-------|
| Cost per SQO | | | | Should decrease |
| Account engagement rate | | | | Should increase |
| BDR meeting rate | | | | Should increase |
| Average deal size | | | | Should increase or hold |
| Time to SQO | | | | Should decrease |
| ICP accuracy (% of selected accounts that engage) | | | | Should increase |

If these metrics aren't improving cohort over cohort, the feedback loop isn't
working. Diagnose whether the issue is data quality, ICP accuracy, channel mix,
or BDR execution.

---

## Integration Notes

### With Other Skills in This Repo

- **Pipeline Attribution Narrator:** Use for the attribution model selection in Phase 7.
  The W-shaped or Full Path models are most appropriate for ABM. The narrator's
  geo/segment split guidance applies when running ABM across multiple regions.

- **GRC Messaging Guardrails:** All ABM content referencing compliance frameworks
  (SOC 2, ISO 27001, HIPAA, GDPR) must be validated through the guardrails skill.
  Compliance terminology errors in Tier 1 personalized content are especially damaging
  because they signal a lack of domain expertise to the exact audience you're trying
  to impress.

- **BDR Enablement Generator (coming):** Phase 6 BDR sequences should be generated
  using the enablement skill once available. This skill provides the strategic
  framework; the BDR skill produces the actual outreach content.

- **Product Context Template:** Upload your ICP, approved messaging, and funnel
  definitions alongside this skill. Phase 1 ICP work will build on your existing
  product context rather than starting from scratch.

### With Your Tech Stack

- **HubSpot:** Use Company records for account-level tracking. Create a custom
  property for ABM Tier (1/2/3) and ABM Cohort. Use Workflows to trigger tier
  promotion alerts. Attribution uses the Deal object, not Contact.

- **LinkedIn Campaign Manager:** Upload matched audience lists by tier. Create
  separate campaigns per tier so you can measure channel contribution at the
  tier level.

- **Intent data platforms (Bombora, G2, TrustRadius):** Feed intent signals into
  Phase 2 account selection and Phase 3 tier promotion triggers. Don't use intent
  data as the sole selection criterion.

- **ABM platforms (Demandbase, 6sense, Terminus):** These tools can automate
  parts of Phase 5 (orchestration) and Phase 7 (measurement). This skill provides
  the strategic layer those tools need to be configured correctly.

---

## Common ABM Mistakes

| Mistake | What Happens | How to Avoid |
|---------|-------------|--------------|
| **Treating ABM as "targeted ads"** | You run LinkedIn ads against an account list and call it ABM. No BDR coordination, no multi-channel orchestration. | ABM requires at minimum: paid media + BDR outreach + content. Ads alone are just account-targeted demand gen. |
| **Selecting too many Tier 1 accounts** | Resources spread thin, no account gets enough attention to progress. | Max 25 Tier 1 accounts. If your team can't support 1:1 engagement for all of them, you have too many. |
| **No BDR alignment** | Marketing warms accounts, BDR doesn't follow up or follows up with generic outreach that ignores the ABM context. | Joint planning session before each cohort. BDR sees the account brief, knows what content the account consumed, and adjusts outreach accordingly. |
| **Mixing acquisition and expansion ABM** | Different motions, different metrics, different teams. Mixing them muddies both. | Run separate cohorts. Expansion ABM targets existing customers for upsell. Acquisition ABM targets net-new logos. |
| **Not running the economics first** | You launch ABM at $3,667 cost per SQO targeting $7K ACV accounts. The math never worked. | Phase 1 exists for this reason. If CAC payback exceeds 12 months, either raise the ACV target or don't do ABM. |
| **Reporting account engagement as pipeline** | Leadership thinks ABM is "working" because engagement scores are high, but no SQOs were created. | Engagement is an operational metric. Report pipeline and revenue to leadership. Use engagement internally to optimize the program. |
| **Skipping the feedback loop** | Each cohort starts from scratch. No compounding. | Phase 8 is non-negotiable. Block 2-3 hours at the end of each cohort to complete the review template. |

---

## Validation Checklist

Run this before launching any ABM cohort.

### Program Design
- [ ] ABM economic viability test completed and viable
- [ ] ICP for ABM defined (not reusing demand gen ICP verbatim)
- [ ] Account list sourced from 3+ channels and cross-referenced
- [ ] Every account scored against the qualification scorecard
- [ ] Accounts tiered with clear criteria and resource allocation defined
- [ ] Tier promotion and demotion rules documented

### Buying Committee
- [ ] Tier 1 accounts have named contacts (minimum 3 per account)
- [ ] Tier 2 accounts have persona-level mapping
- [ ] Key personas identified: economic buyer, technical evaluator, champion, user
- [ ] Content mapped to each persona's priorities

### Execution Readiness
- [ ] Channel plan defined per tier with budget allocation
- [ ] Orchestration sequencing documented (not everything launching at once)
- [ ] BDR account assignments confirmed
- [ ] BDR outreach sequences built and reviewed
- [ ] Handoff criteria agreed with sales
- [ ] CRM fields configured: ABM tier, ABM cohort, ABM-sourced flag

### Measurement
- [ ] ABM-sourced vs. ABM-influenced definitions documented
- [ ] Attribution at account level, not contact level
- [ ] Baseline metrics captured (pre-ABM conversion rates for comparison)
- [ ] Reporting cadence agreed (weekly operational, monthly strategic, quarterly review)
- [ ] Phase 8 review date blocked on calendar before cohort launches

---

## Changelog

- **v1.0** (March 2026): Initial release. 8-phase sequential pipeline, economic viability model, tiering framework, channel orchestration, BDR coordination, measurement framework, closed-loop review template.