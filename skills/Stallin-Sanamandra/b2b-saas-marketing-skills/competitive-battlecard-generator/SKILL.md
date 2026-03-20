# Competitive Battlecard Generator

> A sequential system for building, maintaining, and deploying competitive
> intelligence as battlecards. Each phase produces a defined output that feeds
> the next. Phase 6 captures field intel that keeps battlecards current rather
> than letting them decay into shelf-ware.

## Why This Skill Exists

Competitive battlecards at most B2B SaaS companies are one of two things:

1. **A feature comparison matrix that nobody reads.** Marketing builds a table
   comparing 40 features. Checkmarks everywhere. Sales never opens it because
   it doesn't tell them what to say when a prospect mentions the competitor
   on a live call.

2. **Tribal knowledge in the heads of 2-3 senior reps.** They know what to
   say because they've lost deals to this competitor before. Nobody else on
   the team has that context. When those reps leave, the intel leaves with
   them.

Both fail because they confuse information with enablement. A battlecard
isn't a data sheet. It's a decision aid that tells a rep exactly what to
say, what to ask, and what to avoid in a competitive deal, specific to
the persona they're talking to.

This skill builds battlecards that sales and BDRs actually use, keeps them
current with field feedback, and connects them to the rest of your go-to-market
stack.

## When to Use This Skill

- Building a battlecard for a specific competitor from scratch
- Updating an existing battlecard with new competitive intel
- Responding to a competitor's product launch, pricing change, or acquisition
- Preparing a BDR or AE for a deal where a specific competitor is involved
- Analyzing win/loss data to identify competitive patterns
- Building persona-specific competitive talk tracks
- Reviewing competitive positioning as part of quarterly planning
- Onboarding new sales/BDR team members on competitive landscape

## When NOT to Use This Skill

- General market research or industry analysis (this is competitor-specific)
- Product roadmap planning (competitive intel informs it, but this isn't a
  product management skill)
- Pricing strategy (this skill covers how to handle competitor pricing
  objections, not how to set your own prices)
- Content creation for comparison/alternative pages (use SEO or content skills
  for that; this skill produces internal enablement, not external content)
- Evaluating potential acquisition targets (different analysis framework)

---

## The Battlecard Pipeline: 6 Sequential Phases

```
PHASE 1              PHASE 2              PHASE 3
Competitor       →   Positioning &    →   Persona-Specific
Intelligence          Differentiation      Battlecard
Gathering             Analysis             Assembly

     ↓                                         ↓

PHASE 6              PHASE 5              PHASE 4
Refresh Cycle    ←   Win/Loss         ←   Deployment &
& Decay               Analysis             Enablement
Prevention

     ↓
     └──→ PHASE 1 (next refresh cycle)
```

**The closed loop:** Phase 6 runs on a fixed cadence. Field intel from sales,
new competitor moves, and win/loss patterns feed back into Phase 1. Battlecards
that aren't refreshed every 90 days get flagged for review or retirement.

---

## Phase 1: Competitor Intelligence Gathering

**Input:** Competitor name, your product context, existing intel (if any)
**Output:** Structured competitor intelligence brief

### Intelligence Source Matrix

Gather from multiple sources. No single source gives you the full picture.

| Source | Signal Quality | What to Extract | Update Frequency |
|--------|---------------|-----------------|-----------------|
| **Competitor website** | Medium | Pricing (if public), messaging, feature claims, customer logos, positioning changes | Monthly |
| **G2/TrustRadius reviews** | High | What their customers praise, what they complain about, switching reasons, comparison mentions | Monthly |
| **Your win/loss interviews** | Very High | Why you won, why you lost, what the buyer compared, what mattered most | After every closed deal |
| **Sales call recordings** | High | What prospects say about the competitor unprompted, specific objections, feature comparisons mentioned | Ongoing |
| **Competitor job postings** | Medium | Product direction signals (hiring for a new category = building it), tech stack, growth signals | Quarterly |
| **Competitor blog/changelog** | Medium | Feature launches, messaging shifts, vertical focus changes | Monthly |
| **Industry analyst reports** | Medium | Market positioning, quadrant placement, analyst perspective on strengths/weaknesses | Annually or when published |
| **Social media / LinkedIn** | Low-Medium | Executive messaging, thought leadership themes, customer engagement, employee sentiment | Monthly |
| **Patent/technical filings** | Low | Long-term product direction. Useful for enterprise competitors. | Quarterly |
| **Former competitor employees** | Very High (if available) | Internal roadmap, culture, sales process, known weaknesses | Opportunistic |

### Competitor Intelligence Brief Template

```
COMPETITOR INTELLIGENCE BRIEF

Competitor: ________________________
Last updated: ________________________
Updated by: ________________________
Next review date: ________________________ (max 90 days)

COMPANY OVERVIEW
- Founded: ________
- HQ: ________
- Funding / public status: ________
- Estimated revenue / ARR: ________
- Employee count: ________ (growth trend: ________)
- Key investors / parent company: ________

PRODUCT OVERVIEW
- Core product: [One sentence description]
- Primary use case: [What most customers buy it for]
- Secondary use cases: [What else it does]
- Platform / architecture: [Cloud-native, on-prem, hybrid]
- Key integrations: [Tech stack dependencies]

PRICING (as known)
- Model: [Per user / per asset / per framework / flat rate / usage-based]
- Entry price: $________ [source: ________]
- Mid-market price: $________ [source: ________]
- Enterprise price: $________ [source: ________]
- Free tier / trial: [Yes/No, details]
- Contract terms: [Annual only, monthly available, multi-year discounts]
- Known discounting behavior: [Aggressive, standard, rigid]

TARGET MARKET
- Primary segment: [SMB / Mid-market / Enterprise]
- Key verticals: [Industries they focus on]
- Geo focus: [Where they sell most]
- ICP overlap with us: [High / Medium / Low, specifics]

MESSAGING & POSITIONING
- Primary value prop: [How they describe themselves]
- Key differentiators (their claimed): [What they say makes them different]
- Messaging themes: [Risk, speed, cost, compliance, developer experience, etc.]
- Recent messaging shifts: [Any changes in how they position]

KNOWN STRENGTHS (evidence-based, not assumed)
1. [Strength] — Evidence: [G2 reviews, win/loss data, customer quotes]
2. [Strength] — Evidence: ________
3. [Strength] — Evidence: ________

KNOWN WEAKNESSES (evidence-based, not assumed)
1. [Weakness] — Evidence: [G2 complaints, lost deals to us, technical gaps]
2. [Weakness] — Evidence: ________
3. [Weakness] — Evidence: ________

RECENT MOVES (last 90 days)
- Product: [New features, acquisitions, partnerships]
- Pricing: [Changes, new tiers, discounting patterns]
- Go-to-market: [New campaigns, verticals, channels]
- People: [Key hires, departures, leadership changes]

WHAT THEIR CUSTOMERS SAY (verbatim from G2/reviews)
- Positive: "[Quote]" — [Source]
- Positive: "[Quote]" — [Source]
- Negative: "[Quote]" — [Source]
- Negative: "[Quote]" — [Source]

WHAT OUR PROSPECTS SAY ABOUT THEM (from sales calls)
- "[Quote]" — [Persona, deal stage, outcome]
- "[Quote]" — [Persona, deal stage, outcome]
```

### Intelligence Quality Rules

1. **Cite everything.** Every strength and weakness needs a source. "We think
   they're weak at X" is an opinion. "Three G2 reviews from mid-market CISOs
   mention X as a limitation" is intel.

2. **Separate what they claim from what customers say.** Their website says
   "seamless integration." Their G2 reviews say "integration took 3 months."
   Both matter. The gap between the two is your ammunition.

3. **Date everything.** Intel from 12 months ago is unreliable. Pricing from
   6 months ago may have changed. Mark the date on every data point.

4. **Don't invent weaknesses.** If you don't have evidence of a weakness,
   don't list it. Reps who use unverified claims in deals lose credibility
   when the prospect checks.

---

## Phase 2: Positioning & Differentiation Analysis

**Input:** Competitor intelligence brief (Phase 1), your product context
**Output:** Differentiation map with positioning strategy

### Differentiation Framework

Don't list 40 features. Identify the 3-5 dimensions that actually decide deals.

```
DIFFERENTIATION MAP

Competitor: ________________________
Analysis date: ________________________

DIMENSION 1: ________________________
Us: [Our position on this dimension, with evidence]
Them: [Their position, with evidence]
Buyer impact: [Why this matters to the buyer, not why it matters to us]
Verdict: [Advantage us / Advantage them / Parity]

DIMENSION 2: ________________________
Us: ________
Them: ________
Buyer impact: ________
Verdict: ________

DIMENSION 3: ________________________
Us: ________
Them: ________
Buyer impact: ________
Verdict: ________

DIMENSION 4: ________________________
Us: ________
Them: ________
Buyer impact: ________
Verdict: ________

DIMENSION 5: ________________________
Us: ________
Them: ________
Buyer impact: ________
Verdict: ________

SUMMARY
Dimensions where we win: ________
Dimensions where they win: ________
Dimensions at parity: ________
Our best competitive angle: [The 1-2 dimensions where we have the
strongest advantage AND the buyer cares the most]
```

### How to Pick the Right Dimensions

The dimensions should come from deal data, not from your product team's
feature list.

| Good Dimensions (decide deals) | Bad Dimensions (don't decide deals) |
|-------------------------------|-------------------------------------|
| Time to value / implementation speed | Number of features |
| Framework coverage depth | UI aesthetics |
| Evidence collection automation | Company founding date |
| Multi-framework overlap handling | Number of employees |
| Integration with buyer's existing stack | Number of customers (unless dramatically different) |
| Support quality and responsiveness | Awards or analyst mentions |
| Total cost of ownership (not just license) | Technology stack choice |

**The test:** Ask your last 5 closed-won and 5 closed-lost reps: "What was the
deciding factor?" If a dimension doesn't appear in those answers, it doesn't
belong on the battlecard.

### Positioning Strategy

Based on the differentiation map, pick one of three competitive strategies:

| Strategy | When to Use | How It Sounds |
|----------|------------|---------------|
| **Head-to-head** | You win on the same dimensions they compete on | "We do what they do, but [faster / deeper / cheaper / with better support]." |
| **Reframe** | You lose on their dimension but win on a different one that matters more | "They optimize for [X]. We optimize for [Y]. Here's why [Y] matters more for your situation." |
| **Niche** | You dominate a specific segment or use case they don't serve well | "For [your specific situation], we're purpose-built. They're a general tool being used for a specific job." |

Most competitive deals are won by reframing, not by head-to-head comparison.
If you're competing on their best dimension, you've already lost the
positioning battle.

---

## Phase 3: Persona-Specific Battlecard Assembly

**Input:** Differentiation map (Phase 2), competitor intel (Phase 1)
**Output:** Battlecards formatted for each persona in the buying committee

### Why Persona-Specific Matters

A CISO evaluating your product against a competitor asks different questions
than a CTO evaluating the same comparison. The CISO wants to know about risk
coverage and audit readiness. The CTO wants to know about engineering burden
and integration overhead. Same competitor, different battlecard.

### Battlecard Template (Per Persona)

```
COMPETITIVE BATTLECARD

Competitor: ________________________
Persona: ________________________ [CISO / CTO / Compliance Mgr / etc.]
Version: ________________________
Last updated: ________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUICK REFERENCE (for live calls)

When the prospect mentions [Competitor], say:
"[One sentence acknowledgment that doesn't trash the competitor.
Example: 'They're a solid option. A lot of our customers evaluated
them too. What specifically appealed to you about their approach?']"

Then ask:
"[One diagnostic question that exposes the competitor's weakness
without naming it. Example: 'How important is [dimension where
we win] for your team?']"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OUR 3 ADVANTAGES FOR THIS PERSONA

1. [Advantage]: [One sentence. Why this persona cares.]
   Proof: [Customer quote, metric, case study specific to this persona]

2. [Advantage]: [One sentence.]
   Proof: ________

3. [Advantage]: [One sentence.]
   Proof: ________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THEIR 2 ADVANTAGES (be honest)

1. [Advantage]: [One sentence. Acknowledge it.]
   Our counter: [How to reframe this so it's less decisive.
   Not "that doesn't matter" but "here's the tradeoff they made
   to get that advantage."]

2. [Advantage]: ________
   Our counter: ________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LANDMINES TO SET

Questions to ask the prospect BEFORE they evaluate the competitor.
These seed criteria that favor you.

1. "How does your team handle [process where we're strong]?"
2. "What's your timeline for [outcome where we're faster]?"
3. "Have you thought about [dimension they'll struggle with]?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OBJECTION RESPONSES (persona-specific)

"[Competitor] is cheaper."
→ [Response framework. Not "we're worth more." Instead: "What's
included in that price? When our customers compared total cost
including [implementation / maintenance / FTE time], the gap
[narrowed / reversed]."]

"[Competitor] has [feature we don't have]."
→ [Response. Acknowledge, then redirect: "That's true. The
tradeoff is [what they sacrificed to build that]. For teams
that prioritize [your strength], that tradeoff matters."]

"We're already using [Competitor]."
→ [Response. Don't pitch a rip-and-replace. Instead: "What's
working well? What do you wish was different?" Find the gap.
If no gap exists, this isn't your deal right now.]

"[Competitor] has more customers / is bigger."
→ [Response. "They do. For teams in [your niche / segment /
use case], we have [X] customers including [names if allowed].
The question is whether a bigger company optimizes for your
specific needs or for the average of all their customers."]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TRAP QUESTIONS TO WATCH FOR

Things the competitor may have coached the prospect to ask you.

1. "[Question]" — Why they ask: [What the competitor wants to expose]
   How to respond: [Honest answer that doesn't concede the deal]

2. "[Question]" — Why they ask: ________
   How to respond: ________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROOF POINTS FOR THIS PERSONA

| Customer | Similar to Prospect? | Key Metric | Quote |
|----------|---------------------|------------|-------|
| | [Industry, size, use case] | | |
| | | | |
| | | | |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO NOT SAY

1. [Specific claim about competitor that is unverified or legally risky]
2. [Trash talk or subjective insults about competitor quality]
3. [Outdated information that has been corrected]
```

### Battlecard Honesty Rules

1. **Always include their advantages.** A battlecard that says you win on
   every dimension is a battlecard nobody trusts. Sales reps know when
   you're hiding the competitor's strengths. Include them and teach reps
   how to handle them.

2. **Never fabricate weaknesses.** If you don't have evidence, don't include
   it. A rep who claims "their platform goes down constantly" and the
   prospect says "actually we've had zero downtime issues" just destroyed
   your credibility.

3. **Never instruct reps to trash the competitor.** The framing is always
   "here's the tradeoff" not "they're bad." Prospects respect sellers who
   acknowledge competitor strengths. They distrust sellers who only attack.

4. **Include a "Do Not Say" section.** Legal risks, outdated claims, and
   unverified rumors go here. Protect reps from themselves.

---

## Phase 4: Deployment & Enablement

**Input:** Persona-specific battlecards (Phase 3)
**Output:** Trained sales/BDR team with accessible battlecards

### Deployment Checklist

Building the battlecard is half the work. Getting reps to actually use it is
the other half.

| Step | Action | Owner | Timeline |
|------|--------|-------|----------|
| 1 | Store battlecards in a single, searchable location (not buried in Google Drive) | Marketing ops | Before enablement session |
| 2 | Run a 30-minute enablement session per competitor (not a deck review; a live roleplay) | Product marketing / demand gen lead | Within 1 week of battlecard release |
| 3 | Roleplay the top 3 objection scenarios with BDRs and AEs | Sales manager | During enablement session |
| 4 | Share the "Quick Reference" section as a Slack-accessible snippet | Marketing ops | Same day as enablement |
| 5 | Add battlecard link to CRM deal record template (so reps see it when a competitor is tagged) | Marketing ops | Within 1 week |
| 6 | Collect initial feedback from reps after first 2 weeks of use | Product marketing | 2 weeks post-launch |

### Enablement Session Structure (30 minutes per competitor)

```
COMPETITIVE ENABLEMENT SESSION

Competitor: ________________________
Duration: 30 minutes
Attendees: BDR team, AEs, sales leadership

SECTION 1: CONTEXT (5 minutes)
- Who is this competitor (1 minute)
- Where we see them in deals: which segments, which personas,
  how often (2 minutes)
- Our win rate against them and what decides it (2 minutes)

SECTION 2: THE BATTLECARD (10 minutes)
- Walk through the 3 advantages (with proof points)
- Walk through their 2 advantages (with counters)
- Show the landmine questions

SECTION 3: LIVE ROLEPLAY (15 minutes)
- Scenario 1: Prospect says "We're also looking at [Competitor]"
  One rep plays prospect, another plays seller. Group gives feedback.
- Scenario 2: Prospect says "[Competitor] is cheaper"
  Same format.
- Scenario 3: Prospect says "We're already using [Competitor]"
  Same format.

OUTPUT: Reps leave with the Quick Reference card and confidence
to handle the top 3 competitive scenarios.
```

### Accessibility Rules

| Rule | Rationale |
|------|-----------|
| Battlecards must be accessible in under 10 seconds during a live call | If a rep can't find it fast, they won't use it |
| Store in the tool reps already use (Slack, CRM, Notion, Guru, Gong) | Don't create a new destination. Embed in existing workflow. |
| Mobile-friendly format | Reps take calls on their phones. A PDF that requires pinch-to-zoom is useless. |
| Searchable by competitor name | "How do we beat [X]" should return the right battlecard instantly |
| Version-dated | Reps need to know if they're looking at current intel or 6-month-old data |

---

## Phase 5: Win/Loss Analysis

**Input:** Closed deal data (won and lost), sales feedback
**Output:** Competitive win/loss patterns that update battlecards

### Win/Loss Data Collection

Capture this for every competitive deal, not just the ones you lost.

```
WIN/LOSS COMPETITIVE DATA

Deal: ________________________
Outcome: Won / Lost
Competitor(s) in deal: ________________________
Decision-maker persona: ________________________
Segment: [C1 / C2 / Enterprise]
ACV: $________
Sales cycle length: ________ days

PRIMARY REASON FOR OUTCOME (pick one):
[ ] Price / total cost
[ ] Product capability / feature gap
[ ] Integration / technical fit
[ ] Ease of use / user experience
[ ] Implementation speed / time to value
[ ] Support / customer success quality
[ ] Brand / trust / market presence
[ ] Existing relationship with competitor
[ ] Champion influence
[ ] Procurement / legal / security requirements
[ ] Other: ________________________

DETAILS (from rep or buyer interview):
What did the buyer say was most important? ________________________
What did they say about us vs. competitor? ________________________
If lost: What would have changed the outcome? ________________________
If won: What almost made them choose the competitor? ________________________

QUOTE (if available):
"________________________" — [Buyer persona, anonymous company description]
```

### Win/Loss Pattern Analysis

Run quarterly. Look for patterns, not anecdotes.

```
WIN/LOSS COMPETITIVE ANALYSIS

Competitor: ________________________
Period: Q__ 20__
Deals analyzed: __ won, __ lost

WIN RATE VS. THIS COMPETITOR: __%

TOP 3 REASONS WE WON:
1. [Reason] — appeared in __% of wins
2. [Reason] — appeared in __% of wins
3. [Reason] — appeared in __% of wins

TOP 3 REASONS WE LOST:
1. [Reason] — appeared in __% of losses
2. [Reason] — appeared in __% of losses
3. [Reason] — appeared in __% of losses

PATTERNS BY PERSONA:
- When decision-maker is [Persona A]: win rate __% (we win because ________)
- When decision-maker is [Persona B]: win rate __% (we lose because ________)

PATTERNS BY SEGMENT:
- C1 (SMB) deals: win rate __%
- C2 (Mid-market) deals: win rate __%

PATTERNS BY DEAL SIZE:
- Deals under $__K ACV: win rate __%
- Deals over $__K ACV: win rate __%

BATTLECARD UPDATES NEEDED:
1. [What to add/change based on this data]
2. [What to add/change]
3. [What to remove because it's no longer accurate]
```

### Win/Loss Interview Guide

The best competitive intel comes from buyers who chose the competitor, not from
your own team's speculation. Run these interviews within 30 days of a lost deal.

```
WIN/LOSS INTERVIEW GUIDE (15-20 minutes)

Conducted by: [Someone other than the rep who owned the deal.
Buyers are more honest with a neutral party.]

OPENING:
"Thanks for taking the time. We're trying to improve our product and
our process. Your honest feedback helps, and there are no wrong answers."

QUESTIONS:

1. "Walk me through your evaluation process. How did you decide which
   vendors to look at?"
   [Understand how they found you and the competitor]

2. "What were the 2-3 criteria that mattered most in your decision?"
   [Don't suggest criteria. Let them name them unprompted.]

3. "How did [Competitor] perform against those criteria vs. us?"
   [Get the specific comparison on their terms, not yours]

4. "Was there a moment in the evaluation where you felt one option
   pulled ahead? What was it?"
   [Identify the tipping point. This is the most valuable insight.]

5. "How did pricing factor into the decision?"
   [If price was the decider, dig into whether it was license cost
   or total cost including implementation and maintenance]

6. "If you could change one thing about our product or our process
   during the evaluation, what would it be?"
   [Product feedback AND sales process feedback in one question]

7. "Anything else you'd want us to know?"
   [Open-ended. Sometimes the most useful insight comes here.]
```

---

## Phase 6: Refresh Cycle & Decay Prevention

**Input:** Field intel (Phase 5), competitor monitoring (Phase 1 sources)
**Output:** Updated battlecards on a fixed cadence

### Refresh Cadence

| Trigger | Action | Timeline |
|---------|--------|----------|
| **Scheduled refresh** | Full battlecard review against latest intel | Every 90 days, non-negotiable |
| **Competitor product launch** | Update product overview, assess impact on differentiation map, update objection responses | Within 1 week of announcement |
| **Competitor pricing change** | Update pricing section, recalculate TCO comparison, update pricing objection response | Within 1 week of confirmation |
| **Competitor acquisition / merger** | Reassess entire competitive landscape. May require new battlecard or retirement of old one. | Within 2 weeks |
| **Win/loss pattern shift** | If win rate against a competitor changes by >10% in a quarter, investigate and update | Within 2 weeks of quarterly analysis |
| **New evidence from sales** | Update specific sections (quotes, objection responses, proof points) as intel arrives | Within 1 week of receiving intel |
| **Competitor messaging shift** | Update positioning analysis, check if your landmine questions still work | Within 2 weeks |

### Decay Prevention Rules

Battlecards without maintenance become liabilities. A rep using 6-month-old
pricing data or a discontinued feature comparison in a live deal does more
damage than having no battlecard at all.

```
BATTLECARD HEALTH CHECK (run quarterly)

For each active battlecard:

[ ] Last updated date is within 90 days
    If not: schedule immediate refresh or retire

[ ] Pricing data verified within 60 days
    If not: check competitor website, G2, recent deal intel

[ ] All customer quotes and proof points are from current customers
    (not churned accounts)
    If not: replace with current references

[ ] Win/loss data reflects the last 2 quarters, not historical averages
    If not: rerun win/loss analysis

[ ] At least 2 reps have given feedback on battlecard accuracy
    in the last quarter
    If not: collect feedback before next refresh

[ ] No items in "Do Not Say" section that should now be in the
    main battlecard (competitor fixed a weakness, or claim is
    now verified)
    If not: update accordingly

HEALTH STATUS:
[ ] Green: all checks pass. Schedule next review in 90 days.
[ ] Yellow: 1-2 checks failed. Fix within 2 weeks.
[ ] Red: 3+ checks failed. Battlecard unreliable. Pull from
    circulation until refreshed.
```

### Competitor Monitoring Automation

Where possible, automate the intel gathering so refreshes are data-informed,
not memory-dependent.

| Source | Automation | Tool Options |
|--------|-----------|-------------|
| Competitor website changes | Page change monitoring | Visualping, ChangeTower, or manual monthly screenshot |
| G2 new reviews | Alert on new reviews for competitor | G2 alerts (if available on your plan) |
| Job postings | Track new roles with keywords | LinkedIn alerts, Otta, or manual quarterly check |
| News / press | Google Alerts for competitor name | Google Alerts, Feedly |
| Pricing page changes | Page change monitoring on pricing URL | Visualping on their pricing page specifically |
| Social media / LinkedIn | Track competitor company page and key execs | LinkedIn notifications, manual monthly check |

---

## Integration Notes

### With Other Skills in This Repo

- **BDR Enablement Generator:** Phase 6 objection handling and Phase 4 message
  templates should reference battlecard content. When a BDR encounters a
  competitive deal, they pull from the battlecard's Quick Reference and
  persona-specific objection responses. The BDR skill's monthly performance
  review (Phase 7) captures competitor mentions that feed back into
  battlecard updates here.

- **ABM Program Orchestrator:** Phase 2 account selection includes competitive
  displacement opportunities. The battlecard's intel on competitor weaknesses
  and contract renewal timing directly informs which accounts to target for
  ABM and what messaging angle to lead with.

- **GRC Messaging Guardrails:** All competitive claims referencing compliance
  frameworks must be validated. Saying "[Competitor] doesn't support HIPAA"
  when they actually do, or saying "we're SOC 2 certified" (attestation, not
  certification) in a competitive context, is a credibility-destroying error
  in front of the exact buyer you're trying to win.

- **Pipeline Attribution Narrator:** Competitive deal outcomes should be
  trackable in attribution data. Tag competitive deals in CRM so you can
  measure whether your win rate differs by channel source. If ABM-sourced
  competitive deals have a higher win rate than inbound competitive deals,
  that informs both battlecard deployment and channel allocation.

- **Marketing Ops SOP Generator:** Battlecard distribution and version control
  follow the change management process from Phase 7. Updates to battlecards
  should be logged and communicated through the same channels as other
  marketing ops changes.

### With Your Tech Stack

- **HubSpot / CRM:** Create a custom deal property for "Competitor in Deal"
  (dropdown). This enables win/loss analysis by competitor in Phase 5. Add
  a required field for competitive loss reason on closed-lost deals.

- **Gong / Chorus / call recording:** Keyword alerts for competitor names
  surface competitive mentions automatically. Use these as a continuous
  intel source for Phase 6 refreshes.

- **Slack:** Create a #competitive-intel channel. Reps post competitor
  mentions and buyer quotes in real-time. Marketing aggregates these
  during refresh cycles. Pin the current battlecard Quick Reference in
  the channel.

- **Guru / Notion / internal wiki:** Store full battlecards here. The Quick
  Reference cards go in Slack. Link CRM deal records to the relevant
  battlecard so reps can access it from the deal they're working.

---

## Common Battlecard Mistakes

| Mistake | What Happens | How to Avoid |
|---------|-------------|--------------|
| **Feature comparison matrix instead of battlecard** | 40-row table nobody reads. Reps still wing it on calls. | Focus on 3 advantages, 2 honest disadvantages, and specific talk tracks. Less is more. |
| **Same battlecard for every persona** | CISO gets CTO talking points. CTO gets compliance language. Neither resonates. | Build persona-specific cards. At minimum: technical evaluator, economic buyer, day-to-day user. |
| **Only listing your advantages** | Reps get blindsided when prospects mention competitor strengths. Credibility lost. | Always include their advantages with honest counters. Reps who acknowledge competitor strengths build more trust. |
| **Building it and never updating it** | Pricing is 8 months old. Feature they "lacked" was shipped 3 months ago. Rep uses outdated claim, prospect corrects them. | 90-day refresh cycle. Phase 6. Non-negotiable. |
| **No field validation** | Battlecard is built from marketing's assumptions, not from what buyers actually say. | Win/loss interviews (Phase 5) are the ground truth. Build from deal data, not product marketing's positioning deck. |
| **Storing it somewhere nobody looks** | Beautiful battlecard in a Google Drive folder with 200 other docs. Usage rate: 0%. | Embed in the tools reps already use: Slack, CRM, Gong, Guru. If they have to go find it, they won't. |
| **Trashing the competitor** | Prospect respects the competitor. Your rep insults them. Prospect disqualifies you on trust. | Never trash. Always reframe. "They optimize for X, which makes sense for some teams. We optimize for Y, which matters more when [prospect's situation]." |
| **No enablement session** | Battlecard emailed to the team with "please review." Nobody reviews it. | 30-minute enablement session with live roleplay. Phase 4. It's the difference between a document and a capability. |

---

## Validation Checklist

Run this before deploying any new or refreshed battlecard.

### Intelligence Quality
- [ ] All strengths and weaknesses have cited evidence (not assumptions)
- [ ] Pricing data sourced and dated within 60 days
- [ ] At least 3 G2/review data points included
- [ ] At least 2 win/loss data points from your own deals
- [ ] "Recent Moves" section current within 30 days
- [ ] No unverified claims in the battlecard

### Battlecard Structure
- [ ] Quick Reference section is usable in under 10 seconds on a live call
- [ ] 3 advantages with proof points per persona
- [ ] 2 honest competitor advantages with counters
- [ ] Landmine questions test well (ask a rep if they'd use them)
- [ ] Objection responses cover the top 3-4 competitive objections
- [ ] "Do Not Say" section included
- [ ] Persona-specific versions for at least 2 key personas

### Deployment Readiness
- [ ] Stored in accessible, searchable location
- [ ] Enablement session scheduled within 1 week
- [ ] Roleplay scenarios prepared for session
- [ ] Quick Reference shared in Slack / team channel
- [ ] CRM deal template links to battlecard
- [ ] Feedback collection planned for 2 weeks post-launch

### Maintenance
- [ ] Next refresh date set (max 90 days)
- [ ] Competitor monitoring alerts configured
- [ ] Win/loss data collection process active for competitive deals
- [ ] Decay prevention health check scheduled quarterly

---

## Changelog

- **v1.0** (March 2026): Initial release. 6-phase sequential pipeline, intelligence gathering framework, differentiation analysis, persona-specific battlecard templates, deployment and enablement playbook, win/loss analysis system, refresh cycle with decay prevention.