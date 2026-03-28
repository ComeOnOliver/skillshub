# BDR Enablement Generator

> A sequential system for producing everything a BDR needs to work an account:
> research, outreach sequences, talk tracks, and objection handling. Each phase
> builds on the previous one. Phase 7 feeds learnings back into Phase 1.

## Why This Skill Exists

BDR enablement at most B2B SaaS companies is one of two things:

1. **A CRM record and a "go get 'em."** The BDR gets an account name, maybe a
   company size and industry, and is expected to figure out the rest. Research
   quality depends entirely on the individual BDR's skill and how much time
   they have before their next dial.

2. **A generic sequence template.** Marketing writes a 5-email sequence with
   placeholder fields. Every account gets the same structure, same value props,
   same call to action. Personalization means swapping in {company_name} and
   {first_name}.

Both approaches fail for the same reason: the outreach doesn't reflect what the
buyer actually cares about. A CISO evaluating compliance automation has different
concerns than a CTO evaluating the same product. A company that just raised Series
B has different urgency than one preparing for an enterprise customer's vendor
security review.

This skill encodes the research-to-outreach pipeline so that every account gets
outreach grounded in actual context, and every persona gets messaging matched to
their priorities.

## When to Use This Skill

- Researching a target account before BDR outreach
- Building a personalized outreach sequence for a specific account or account tier
- Creating persona-specific talk tracks (CISO vs. CTO vs. Compliance Manager)
- Developing objection handling responses for common buyer pushback
- Onboarding new BDRs who need to ramp on your product and buyer landscape
- Reviewing BDR outreach performance and iterating on messaging
- Generating account briefs for ABM Tier 1 and Tier 2 accounts
- Preparing BDRs for discovery calls with specific accounts

## When NOT to Use This Skill

- Broad demand gen campaign copywriting (this is 1:1 and 1:few, not 1:many)
- Marketing email nurture sequences (different motion, different cadence)
- Sales negotiation or closing strategies (this is top-of-funnel, not bottom)
- Customer success outreach (different relationship, different goals)
- Cold outreach to accounts with no ICP fit (fix targeting first, then enable)

---

## The BDR Enablement Pipeline: 7 Sequential Phases

```
PHASE 1              PHASE 2              PHASE 3              PHASE 4
Account Research →   Account Brief    →   Sequence Design  →   Message
                                                               Generation

     ↓                                                              ↓

PHASE 7              PHASE 6              PHASE 5
Performance      ←   Objection        ←   Talk Track
Review & Loop        Handling              Development

     ↓
     └──→ PHASE 1 (next account batch)
```

**The closed loop:** Phase 7 captures what worked, what didn't, and what buyers
actually said. Those learnings refine account research criteria, sequence design,
and objection responses for the next batch.

---

## Phase 1: Account Research

**Input:** Account name, ABM tier (if applicable), ICP criteria
**Output:** Structured account research document

### Research Framework

Don't give BDRs a blank page. Give them a structured research template that takes
30 minutes to complete per Tier 1 account and 10 minutes per Tier 2.

#### Account Research Template

```
ACCOUNT: [Company Name]
TIER: [1 / 2 / 3]
RESEARCHED BY: [BDR Name]
DATE: [Date]

COMPANY OVERVIEW
- Industry: [Primary vertical]
- Employee count: [Range]
- Revenue estimate: [Range or funding stage]
- HQ location: [City, Country]
- Key product/service: [One sentence]

COMPLIANCE & SECURITY POSTURE
- Known frameworks: [SOC 2, ISO 27001, HIPAA, GDPR, PCI DSS, etc.]
- Compliance maturity signal: [Early/building, Established, Advanced]
  Evidence: [Job postings, case studies, public disclosures, trust page]
- Current tools (if known): [Competitor platforms, manual processes]
  Source: [G2 review, job posting, LinkedIn, public case study]

BUYING TRIGGERS
- [ ] Recent funding round (amount, date, source)
- [ ] New security/compliance hire (name, title, start date)
- [ ] Enterprise customer acquisition (triggers vendor security reviews)
- [ ] Compliance deadline approaching (audit date, framework)
- [ ] Competitor contract renewal (estimated timing)
- [ ] Regulatory change affecting their industry
- [ ] Public security incident or data breach
- [ ] IPO preparation (SOC 2 often required)

BUYING COMMITTEE (KNOWN CONTACTS)
| Name | Title | LinkedIn | Relevance | Notes |
|------|-------|----------|-----------|-------|
| | | | Economic Buyer / Tech Eval / Champion / User / Blocker | |

RECENT ACTIVITY
- Company news: [Relevant press, blog posts, product launches]
- LinkedIn activity: [Key contacts' recent posts or engagement]
- Website changes: [New trust page, compliance mentions, job postings]
- Review activity: [G2, TrustRadius reviews written or platform evaluated]

OUTREACH ANGLE
Primary hook: [The specific reason this account should care right now]
Supporting evidence: [What makes the hook credible, not generic]
Persona priority: [Which buying committee member to approach first and why]
```

### Research Source Priority

Not all sources are equal. Prioritize by signal quality.

| Source | Signal Strength | What to Look For |
|--------|----------------|------------------|
| **Job postings** | High | Compliance/security roles being hired = building the function. Specific tool mentions = current stack. |
| **Company trust/security page** | High | Frameworks listed, SOC 2 report availability, security questionnaire process. |
| **G2/TrustRadius reviews** | High | Reviews they've written (shows what they evaluate) and reviews of competitors. |
| **LinkedIn (key contacts)** | Medium-High | Recent posts about compliance challenges, conference attendance, tool evaluations. |
| **Funding announcements** | Medium | Series B+ often triggers compliance investment. Enterprise customer wins require vendor security. |
| **Company blog/news** | Medium | Compliance-related announcements, partnership with audit firms, customer case studies mentioning security. |
| **Generic company info** (Crunchbase, website) | Low | Good for firmographics. Low value for outreach personalization. |

### Research Depth by Tier

| Tier | Time per Account | Research Depth |
|------|-----------------|----------------|
| **Tier 1** | 30-45 minutes | Full template. Every section completed. Named contacts with LinkedIn profiles. Specific outreach angle. |
| **Tier 2** | 10-15 minutes | Company overview, compliance posture, top 1-2 buying triggers, primary persona identified. |
| **Tier 3** | 0 minutes (programmatic) | ICP data from enrichment tools only. No manual research. Outreach is template-based. |

---

## Phase 2: Account Brief

**Input:** Completed account research (Phase 1)
**Output:** One-page account brief that a BDR can reference during outreach

The account brief distills research into an actionable document. A BDR should be
able to read it in 2 minutes and know exactly why they're reaching out, who they're
reaching out to, and what angle to lead with.

### Account Brief Template

```
ACCOUNT BRIEF: [Company Name]
Prepared: [Date] | Tier: [1/2/3] | Priority: [High/Medium/Low]

WHY THIS ACCOUNT, WHY NOW
[2-3 sentences. The specific trigger or combination of signals that make this
account worth pursuing right now. Not "they fit our ICP." What changed or what's
happening that creates urgency.]

PRIMARY CONTACT
Name: [Full name]
Title: [Title]
Persona type: [CISO / CTO / Compliance Manager / VP Engineering]
LinkedIn: [URL]
Key insight: [Something specific from their LinkedIn activity, posts, or
background that informs the outreach angle]

SECONDARY CONTACTS
[Name, Title, Persona type for 1-2 additional committee members]

THEIR LIKELY PAIN
Based on [evidence source], this account is probably dealing with:
1. [Specific pain point tied to their situation, not generic]
2. [Second pain point if supported by evidence]

WHAT THEY'RE LIKELY USING TODAY
[Current solution: competitor platform, manual spreadsheets, audit firm handling
it, or nothing. Source of this info.]

MESSAGING ANGLE
Lead with: [The specific insight or trigger to reference in first touch]
Avoid: [Any topics or claims that would backfire with this specific account]
Proof point: [The case study, metric, or example most relevant to their situation]

COMPETITIVE NOTES
[If they're using a competitor: what that competitor is weak at that matters
to this account. If greenfield: what the cost of their current manual process is.]
```

### Brief Quality Check

Before a BDR uses the brief, it should pass these tests:

- [ ] "Why now" section references something that happened in the last 90 days
- [ ] Primary contact has a specific insight, not just a title
- [ ] Pain points are inferred from evidence, not assumed from ICP
- [ ] Messaging angle is specific enough that it wouldn't work for a different account
- [ ] Competitive notes reflect what the account cares about, not your feature list

---

## Phase 3: Sequence Design

**Input:** Account brief (Phase 2), tier assignment
**Output:** Outreach sequence structure with channel mix and timing

### Sequence Architecture by Tier

**Tier 1: Fully personalized (14 touches, 28 days)**

| Touch | Day | Channel | Purpose |
|-------|-----|---------|---------|
| 1 | 1 | LinkedIn | Connection request with trigger-based note |
| 2 | 2 | Email | Insight-led opening (not product pitch) |
| 3 | 4 | LinkedIn | Engage with their content or share relevant research |
| 4 | 7 | Email | Industry-specific proof point (case study, metric) |
| 5 | 9 | Phone | Reference email engagement if opens/clicks detected |
| 6 | 11 | LinkedIn | Direct message with custom content piece |
| 7 | 14 | Email | Ask for conversation with specific value prop |
| 8 | 16 | Phone | Voicemail referencing email + LinkedIn touches |
| 9 | 18 | LinkedIn | Voice note (pattern interrupt) |
| 10 | 21 | Email | New angle based on different pain point or persona |
| 11 | 23 | Direct mail | Physical piece for non-responsive high-value accounts |
| 12 | 25 | Email | Reference direct mail, tie to specific deadline or event |
| 13 | 27 | Phone | Final attempt, reference full engagement history |
| 14 | 28 | Internal | Score engagement, decide: continue, pause, escalate, or multi-thread |

**Tier 2: Persona-templated (10 touches, 21 days)**

Same structure as Tier 1 but personalization is at the persona level (all CISOs
get CISO-specific messaging), not the individual level. Removes touches 9, 11,
and collapses direct mail. Phone touches are optional based on BDR capacity.

**Tier 3: Programmatic (5 touches, 14 days)**

Automated email sequence triggered by intent signals or engagement thresholds.
No phone, no LinkedIn, no manual personalization. BDR only engages if the account
responds or hits an engagement threshold.

### Sequence Design Rules

1. **Never lead with product.** Touch 1 and 2 are about the buyer's world, not
   yours. Product enters at touch 4 earliest, and only through a proof point.

2. **Multi-channel is non-negotiable for Tier 1-2.** Email-only sequences for
   named accounts are not BDR outreach. They're automated nurture pretending
   to be personal.

3. **Space touches by signal, not just by calendar.** If the prospect opens
   email 2 three times, pull touch 5 (phone) forward. If there's zero
   engagement through touch 6, don't keep the same cadence. Adjust.

4. **Each touch must add new value.** If touch 4 says the same thing as touch 2
   with different words, it's not a sequence. It's repetition.

5. **End with a door open, not a guilt trip.** Touch 13-14 should leave the
   relationship intact for future outreach. "Not the right time" is a valid
   outcome. "I've reached out 14 times and you haven't responded" is not.

---

## Phase 4: Message Generation

**Input:** Sequence structure (Phase 3) + account brief (Phase 2)
**Output:** Ready-to-send messages for each touch in the sequence

### Email Templates by Persona

Each template follows the same structure. The content changes based on persona.

**Structure:**
```
Subject line: [Specific to their situation. No "Quick question" or "Checking in."]

[Opening: 1-2 sentences referencing their specific trigger or situation.
Not "I noticed your company..." generic opener.]

[Insight: 2-3 sentences sharing a perspective on their problem that they
haven't considered. Not your product pitch. Something they'd find useful
even if they never buy from you.]

[Bridge: 1 sentence connecting the insight to how you've seen it solved.
This is where your product enters, indirectly.]

[Ask: 1 sentence. Specific, low-friction. Not "Would love to set up a call."
Instead: "Worth a 15-minute conversation to see if [specific outcome] applies
to your situation?"]
```

#### CISO / Head of Security

**Primary concerns:** Risk reduction, audit readiness, board reporting, team bandwidth
**Language to use:** Risk posture, evidence collection, audit cycles, control mapping
**Language to avoid:** "Easy," "simple," "automate everything" (CISOs are skeptical
of silver bullets)

```
CISO EMAIL TEMPLATE (Touch 2)

Subject: [Framework] evidence collection before [their audit timeline/trigger]

[Name],

[Reference trigger: "Saw that [company] just brought on [enterprise customer] -
congrats. In our experience, that usually triggers a SOC 2 evidence request
within the first 90 days of the vendor review process."]

[Insight: "The teams that handle this smoothly aren't the ones with the most
compliance staff. They're the ones who mapped their controls to evidence
sources before the auditor asked. The scramble happens when evidence collection
is manual and scattered across 4-5 tools."]

[Bridge: "We've helped [similar company in their vertical] cut their audit prep
from 12 weeks to 3 by automating evidence collection against [relevant framework]."]

[Ask: "If [company] is heading into a SOC 2 cycle, worth a 15-minute look at
how [similar company] handled it?"]

[Name]
```

#### CTO / VP Engineering

**Primary concerns:** Engineering time spent on compliance, integration burden,
developer experience, build-vs-buy
**Language to use:** Engineering hours, API-first, CI/CD integration, automated
controls, developer workflow
**Language to avoid:** "Compliance made easy" (CTOs don't buy "easy," they buy
"doesn't waste my engineers' time")

```
CTO EMAIL TEMPLATE (Touch 2)

Subject: engineering hours on [framework] at [company]

[Name],

[Reference trigger: "Noticed [company] is hiring a compliance engineer.
In most teams we talk to, that role ends up spending 60% of their time
on evidence collection and 40% on actual compliance architecture."]

[Insight: "The ratio flips when evidence collection pulls directly from
your existing stack. If your controls are already in AWS/GCP and your
CI/CD pipeline, the data exists. The work is mapping it to framework
requirements, not generating it from scratch."]

[Bridge: "At [similar company], their compliance engineer spends about
5 hours per week on evidence, down from 20+, because the collection
runs against their existing infrastructure."]

[Ask: "Would it be useful to see how that mapping works against your
stack? Happy to walk through it in 15 minutes."]

[Name]
```

#### Compliance Manager / GRC Manager

**Primary concerns:** Day-to-day compliance operations, audit management,
cross-framework efficiency, evidence gaps, reporting to leadership
**Language to use:** Control libraries, evidence repositories, continuous
monitoring, framework overlap, audit trail
**Language to avoid:** Technical jargon beyond their role (API endpoints,
infrastructure-level language)

```
COMPLIANCE MANAGER EMAIL TEMPLATE (Touch 2)

Subject: [framework] evidence gaps before Q[X] audit

[Name],

[Reference trigger: "Saw that [company] added ISO 27001 to your trust page
alongside SOC 2. Managing overlapping frameworks is where most compliance
teams hit a wall, not because the work is hard but because the same evidence
gets collected twice in two different formats."]

[Insight: "Teams running 2+ frameworks find that 40-60% of controls overlap.
The ones who map that overlap once and automate evidence collection against
shared controls cut their workload nearly in half. The ones who treat each
framework as a separate project double their work every time they add a new
standard."]

[Bridge: "[Similar company] went from SOC 2 only to SOC 2 + ISO 27001 +
HIPAA in 6 months without adding headcount. The shared control mapping
did most of the heavy lifting."]

[Ask: "If you're managing the overlap manually right now, worth 15 minutes
to see how [similar company] structured it?"]

[Name]
```

### Subject Line Rules

| Do | Don't |
|----|-------|
| Reference their specific situation | "Quick question" / "Checking in" / "Following up" |
| Use lowercase (feels like a real email) | Title Case Every Word |
| Keep it under 8 words | Write a sentence as a subject line |
| Include their framework or trigger | Use your product name in the subject |
| Make it scannable in a mobile notification | Add brackets like [IMPORTANT] or [ACTION NEEDED] |

### LinkedIn Message Rules

LinkedIn messages have a 300-character limit for connection requests and work
differently than email. Adjust accordingly.

| Rule | Rationale |
|------|-----------|
| Connection request note: 1-2 sentences max | Anything longer gets truncated or ignored |
| Reference something specific (post they wrote, mutual connection, company news) | Generic "I'd love to connect" has <5% accept rate |
| No pitch in the connection request | You haven't earned the right to pitch yet. Connect first, add value, then message. |
| First DM after connection: share something useful, don't ask for anything | A relevant article, a congratulations on a specific win, or a question about their recent post |
| Pitch (if at all) comes in DM #2 or later | And it should feel like a natural extension of the conversation, not a script |

---

## Phase 5: Talk Track Development

**Input:** Persona templates (Phase 4) + account brief (Phase 2)
**Output:** Discovery call frameworks and persona-specific talk tracks

### Discovery Call Structure

This is not a script. It's a structure. BDRs who read from scripts sound like
BDRs reading from scripts. The structure ensures key ground is covered while
allowing natural conversation.

```
DISCOVERY CALL FRAMEWORK (15-20 minutes)

OPENING (2 minutes)
- Thank them for the time
- Confirm the agenda: "I'd like to understand [specific aspect of their
  situation] and share how [similar companies] have handled it. If it makes
  sense, we can talk about next steps. If not, no pressure."
- Key: set the expectation that "no" is an acceptable outcome. This reduces
  defensiveness.

SITUATION (5 minutes)
- "Walk me through how your team handles [relevant process] today."
- "How many people are involved in [audit prep / evidence collection /
  compliance management]?"
- "What tools are you using for this currently?"
- LISTEN. Do not pitch during this section. The goal is to understand their
  current state, not to react to every pain point with a feature.

PAIN (5 minutes)
- "What's the most time-consuming part of that process?"
- "When's your next [audit / compliance deadline]?"
- "What happens if [evidence gap / audit finding / compliance miss] occurs?"
- "How does your leadership team view compliance investment right now?"
- Note: pain questions should be informed by the account brief. If you
  already know their trigger, ask about it specifically rather than fishing
  generically.

IMPACT (3 minutes)
- "If you could reclaim the hours your team spends on [manual process],
  where would that time go?"
- "What would it mean for your team if [audit prep / evidence collection]
  took 3 weeks instead of 12?"
- "Is [compliance expansion / new framework] something leadership is
  asking about?"
- Goal: get them to articulate the value of solving this problem in their
  own words. Their words become your closing argument later.

NEXT STEP (2 minutes)
- If qualified: "Based on what you've shared, I think it's worth showing
  you how [specific outcome] works in practice. Can I set up a 30-minute
  demo with [name], who works with teams like yours?"
- If not qualified: "Sounds like the timing isn't right for [reason]. Mind
  if I check back in [specific timeframe] when [trigger] might be closer?"
- If unclear: "Would it help to see a quick [framework coverage matrix /
  time-savings calculator / case study] before deciding if a deeper
  conversation makes sense?"
```

### Persona-Specific Talk Tracks

#### Talking to CISOs

| They Say | You Do |
|----------|--------|
| "We handle compliance internally." | Don't challenge. Ask: "How much of your team's time goes to evidence collection vs. actual security architecture?" The goal is to surface the hidden cost, not argue. |
| "We already have a tool for this." | Ask which one. Then ask: "What's the one thing you wish it did better?" Competitors have known gaps. Know them before the call. |
| "I report to the board on this." | This is your opening. Ask: "What does your board reporting process look like today? How much prep time goes into each report?" Board reporting pain is a strong buying trigger. |
| "Security is our top priority." | Don't agree generically. Ask: "Where does compliance sit relative to security in terms of team bandwidth?" This separates the statement from reality. |

#### Talking to CTOs

| They Say | You Do |
|----------|--------|
| "My engineers shouldn't be doing compliance work." | Agree. Then ask: "How many engineering hours per month go to compliance-related tasks right now?" Quantifying the problem makes it real. |
| "We'll build this ourselves." | Don't argue. Ask: "What's your estimated build time and ongoing maintenance cost?" Then share what similar companies found when they ran the same analysis. Most underestimate maintenance by 3-5x. |
| "We need something that integrates with our stack." | This is buying intent. Ask about their specific stack. Map it to your integration list. If there's a gap, be honest about it. |
| "Compliance isn't my problem." | Ask: "Who owns it today?" If the answer is "nobody" or "shared," that's a pain signal. If it's a named person, ask to be introduced. |

#### Talking to Compliance Managers

| They Say | You Do |
|----------|--------|
| "We're managing fine with spreadsheets." | Don't judge. Ask: "How long does evidence collection take before each audit cycle?" The answer is usually measured in weeks, which makes the case for you. |
| "We're adding a new framework next quarter." | This is your trigger. Ask: "Have you mapped the control overlap between [current] and [new framework] yet?" If no, that's the value you bring. If yes, ask how they're handling evidence for shared controls. |
| "My auditor handles most of it." | Ask: "What does that cost per audit cycle?" External auditor dependence is expensive and opaque. Quantify it. |
| "I'm the only compliance person." | This is a strong signal. A solo compliance person managing multiple frameworks is overwhelmed. Ask about their biggest time sink. The answer becomes your pitch. |

---

## Phase 6: Objection Handling

**Input:** Common buyer pushback patterns + talk track outcomes (Phase 5)
**Output:** Objection response framework

### Objection Handling Principles

1. **Never argue.** Agree with the concern, then reframe it. "You're right that
   [concern]. What we've found is [reframe]."

2. **Use customer evidence, not product claims.** "We can do X" is marketing.
   "[Similar company] achieved X" is proof.

3. **Quantify the status quo.** Most objections defend the current state. Make the
   cost of the current state concrete. "How many hours per audit cycle?" is more
   persuasive than "our tool saves time."

4. **Know when to walk away.** Not every objection is a buying signal. Some are
   genuine disqualifiers. Recognize them early and exit gracefully.

### Objection Response Matrix

| Objection | Category | Response Framework |
|-----------|----------|-------------------|
| **"We're not looking at this right now."** | Timing | "Understood. When is your next [audit cycle / compliance deadline]? Most teams start evaluating 3-4 months before. Mind if I reach out then with a prep checklist?" (Set a specific callback date. Don't accept "sometime next year.") |
| **"We already use [Competitor]."** | Competitive | "Good to know. How's it working for [specific use case you know the competitor is weak on]?" (Don't trash the competitor. Find the gap through questions. Every platform has gaps.) |
| **"It's too expensive."** | Price | "What are you comparing it to?" (Often they're comparing to their current cost of zero, ignoring the hidden cost of manual work. Quantify: "[Similar company] was spending $X in labor hours before switching.") |
| **"We can build this in-house."** | Build vs. buy | "Totally fair. What's your estimated build timeline and ongoing maintenance commitment?" (Share data: "Teams we talk to estimate 3 months to build, but maintenance usually runs 2-3x the initial build cost annually.") |
| **"I need to talk to my team / boss."** | Authority | "Of course. Would it help if I put together a one-page summary you could share? What questions do you think they'll have?" (Enable the internal champion. Don't just wait for them to sell it themselves.) |
| **"We're too small for this."** | Fit | "What frameworks do your customers require from you?" (If the answer is SOC 2, ISO 27001, or similar, they're not too small. They're at the stage where compliance is becoming a revenue blocker.) |
| **"We just went through our audit."** | Timing | "How did it go? What was the most painful part?" (Post-audit is actually a great time. The pain is fresh. Position continuous monitoring as a way to avoid repeating the worst parts.) |
| **"Send me some information."** | Brush-off | "Happy to. What specific question would the information need to answer for you?" (If they can't name a specific question, it's a brush-off. If they can, you now know their real concern.) |
| **"We're focused on security, not compliance."** | Misframe | "Makes sense. How do you handle the evidence and reporting side when auditors or customers ask for proof of your security controls?" (Security and compliance are different. But the evidence burden is the bridge.) |

### Disqualification Signals

Not every objection is worth overcoming. Recognize when an account doesn't fit.

| Signal | Interpretation | Action |
|--------|---------------|--------|
| No compliance requirement from customers or regulators | No buying trigger exists | Remove from active outreach. Add to long-term nurture. |
| <50 employees with no enterprise customer base | CAC won't justify the deal size | Disqualify unless they're pre-IPO or have explicit compliance deadlines. |
| Recently signed a 2-3 year contract with a competitor | No switching opportunity for 18+ months | Note contract end date. Set a reminder for 6 months before renewal. |
| "We had a bad experience with [your product] before" | Trust deficit | Escalate to a senior team member. Don't try to overcome this at BDR level. |
| No one in the organization owns compliance | No internal champion possible | Disqualify unless a recent hire or job posting suggests this is changing. |

---

## Phase 7: Performance Review & Feedback Loop

**Input:** Outreach activity data + BDR qualitative feedback
**Output:** Performance review document that updates Phases 1-6 for the next batch

### BDR Performance Metrics

Track these at the individual BDR, sequence, and persona level.

**Activity metrics (leading indicators):**

| Metric | Definition | Benchmark |
|--------|-----------|-----------|
| Emails sent per day | Total outreach emails (not automated nurture) | 40-60 for Tier 2-3, 15-25 for Tier 1 |
| LinkedIn touches per day | Connection requests + messages + engagement | 15-25 |
| Calls per day | Dials, not just connections | 30-50 |
| Research briefs completed per week | Tier 1 account briefs fully prepared | 5-10 |

**Effectiveness metrics (lagging indicators):**

| Metric | Definition | Benchmark |
|--------|-----------|-----------|
| Email reply rate | Replies / emails sent (exclude bounces) | 5-15% for cold, 15-30% for ABM |
| Positive reply rate | Interested replies / total replies | 30-50% of replies |
| LinkedIn acceptance rate | Connections accepted / requests sent | 20-40% |
| Meeting booked rate | Meetings / total accounts worked | 5-10% for cold, 10-20% for ABM |
| SQO conversion rate | SQOs / meetings booked | 30-50% |
| Sequence completion rate | Accounts that received all touches / accounts started | 70%+ (low means BDRs are giving up early) |

**Quality metrics (reported to marketing):**

| Metric | Definition | Why Marketing Cares |
|--------|-----------|---------------------|
| Top-performing subject lines | Open rates by subject line across the team | Informs ad copy and campaign email headers |
| Objection frequency | Which objections come up most often, by persona | Signals messaging gaps. If "too expensive" is #1, pricing page or ROI content needs work. |
| Competitor mentions | Which competitors are in deals, by segment | Informs competitive positioning and battlecard updates |
| Pain points confirmed | Which pains from the brief actually resonated | Validates or invalidates ICP assumptions |
| Channel preference by persona | Which channel generated the most replies per persona | Informs channel allocation for ABM orchestration |

### Monthly Performance Review Template

```
BDR ENABLEMENT REVIEW: [Month] [Year]

VOLUME
- Accounts worked: [X] (T1: [X], T2: [X], T3: [X])
- Total touches: [X] (email: [X], phone: [X], LinkedIn: [X], other: [X])
- Meetings booked: [X]
- SQOs created: [X]

EFFECTIVENESS
- Email reply rate: [X]% (vs. [X]% prior month)
- Meeting booked rate: [X]% (vs. [X]% prior month)
- SQO conversion: [X]% (vs. [X]% prior month)

TOP PERFORMING
- Best sequence: [Which tier/persona sequence had highest meeting rate]
- Best channel: [Which channel drove most meetings this month]
- Best subject line: [Highest open rate subject line]
- Best outreach angle: [Which trigger/hook resonated most]

WHAT BUYERS SAID (verbatim quotes from replies and calls)
- "[Direct quote about their pain]" - [Persona type, company size]
- "[Direct quote about competitor]" - [Persona type, company size]
- "[Direct quote about objection]" - [Persona type, company size]

UPDATES FOR NEXT MONTH

Research updates:
- [Add/remove research criteria based on what actually mattered in outreach]

Sequence updates:
- [Adjust timing, channel mix, or number of touches based on data]

Message updates:
- [Specific subject lines, opening lines, or proof points to rotate in/out]

Talk track updates:
- [New objection responses or discovery questions based on call feedback]

ICP feedback to marketing:
- [Signals that the ICP needs refining: certain verticals converting better,
  certain company sizes not responding, certain triggers not real]
```

### The Feedback Loop in Practice

| What BDR Reports | Where It Goes | What Changes |
|-----------------|---------------|--------------|
| "CISOs respond better to risk language than ROI language" | Phase 4 (message templates) | CISO emails rewritten with risk-first framing |
| "Compliance managers don't know what SKILL.md means" | Phase 4 (messaging) | Remove technical jargon from compliance manager sequences |
| "[Competitor] contract renewals are happening in Q3" | Phase 1 (research) | Add competitor renewal timing to research template |
| "Nobody responds after touch 8" | Phase 3 (sequence design) | Shorten Tier 2 sequence or change channels for touches 9+ |
| "IPO prep is a stronger trigger than funding round" | Phase 1 (research), Phase 2 (brief) | Reprioritize buying triggers in research template |
| "We keep losing to [competitor] on [feature]" | Marketing (competitive intel) | Update battlecards, create content addressing the gap |

---

## Integration Notes

### With Other Skills in This Repo

- **ABM Program Orchestrator:** Phase 6 of the ABM skill (BDR Coordination)
  provides the strategic framework. This skill produces the actual content: briefs,
  sequences, messages, talk tracks. Use ABM Orchestrator to design the program,
  then BDR Enablement Generator to arm the team.

- **GRC Messaging Guardrails:** Every message generated by this skill that references
  compliance frameworks must pass through GRC Messaging Guardrails. SOC 2 is an
  attestation, not a certification. HIPAA has no certification. ISO 27001 is
  certified by an accredited body. Getting this wrong in BDR outreach to a CISO
  is the exact credibility kill that motivated the guardrails skill.

- **Pipeline Attribution Narrator:** BDR-sourced pipeline attribution should be
  tracked using the narrator's framework. Specifically: if a BDR books a meeting
  with an ABM account that marketing warmed with ads, attribution should credit
  both (ABM-sourced, BDR-converted). The narrator's "sourced vs. influenced"
  distinction applies here.

- **Product Context Template:** Upload your approved messaging, case studies, and
  competitive positioning alongside this skill. The message generation phase will
  pull proof points and customer evidence from your context file.

### With Your Tech Stack

- **HubSpot:** Use Sequences for Tier 2-3 outreach automation. Tier 1 should be
  manual sends tracked in the CRM, not automated sequences, to ensure
  personalization quality. Use Contact properties for persona type and ABM tier.
  Log call notes in the Activity timeline for handoff context.

- **LinkedIn Sales Navigator:** Primary research tool for Phase 1. Use Saved
  Searches for Tier 2-3 prospecting. Use Account alerts for Tier 1 trigger
  monitoring.

- **Outreach/Salesloft:** If using a sales engagement platform, map the sequence
  structures from Phase 3 directly into the platform. Use A/B testing on subject
  lines and opening lines to generate data for Phase 7 review.

---

## Common BDR Enablement Mistakes

| Mistake | What Happens | How to Avoid |
|---------|-------------|--------------|
| **Generic sequences for all accounts** | Reply rates drop to 2-3%. BDRs burn through the account list. | Tier the list. Personalize Tier 1. Template by persona for Tier 2. Automate Tier 3 only. |
| **Leading with product features** | Buyers tune out because they don't see their problem reflected. | First 2 touches are about their world, not yours. Product enters at touch 4 through proof points. |
| **No research before outreach** | BDR calls a company that uses a competitor and doesn't know. Or pitches HIPAA to a company with no healthcare customers. | Phase 1 research is not optional for Tier 1-2. 15-30 minutes of research saves hours of wasted outreach. |
| **Same message to CISO and Compliance Manager** | Both are in compliance, but they care about different things. CISOs think in risk. Compliance managers think in process. | Separate persona templates with different language, pain points, and proof points. |
| **BDR feedback stays in Slack, never reaches marketing** | Messaging gaps persist. The same objections come up every month. Marketing creates content that doesn't match buyer reality. | Monthly review template (Phase 7) is mandatory. BDR qualitative feedback is one of marketing's most valuable inputs. |
| **Measuring activity instead of effectiveness** | BDRs optimize for emails sent, not meetings booked. Volume goes up, quality goes down. | Track reply rates and meeting rates alongside activity. A BDR sending 100 generic emails is less effective than one sending 30 personalized ones. |
| **No disqualification criteria** | BDRs spend weeks on accounts that were never going to buy. | Define disqualification signals (Phase 6). Make it safe and expected for BDRs to disqualify accounts. |

---

## Validation Checklist

Run this before deploying new outreach sequences or enabling a new BDR.

### Content Quality
- [ ] All compliance terminology validated against GRC Messaging Guardrails
- [ ] Email templates reviewed for persona-appropriate language
- [ ] No product jargon in first two touches of any sequence
- [ ] Subject lines are under 8 words and reference the buyer's situation
- [ ] Case studies and proof points are from the buyer's vertical or company size
- [ ] All claims are accurate and sourced (no invented metrics)

### Sequence Structure
- [ ] Each tier has a defined sequence with channel mix and timing
- [ ] No two consecutive touches use the same channel
- [ ] Each touch adds new value (not a rephrased version of the previous touch)
- [ ] Sequence includes clear exit criteria and next-step actions
- [ ] Tier 1 sequences include non-digital touches (phone, direct mail)

### BDR Readiness
- [ ] BDR has completed account briefs for all Tier 1 accounts
- [ ] BDR can articulate the difference between each persona's priorities
- [ ] BDR knows the top 3 competitor weaknesses relevant to their accounts
- [ ] BDR has practiced the discovery call structure (not memorized a script)
- [ ] BDR knows disqualification criteria and when to exit

### Measurement
- [ ] Tracking configured for reply rates, meeting rates, and SQO conversion
- [ ] A/B testing enabled for subject lines (minimum)
- [ ] Monthly review cadence set with marketing
- [ ] Feedback loop template shared with BDR team

---

## Changelog

- **v1.0** (March 2026): Initial release. 7-phase sequential pipeline, account research framework, brief template, sequence architecture by tier, persona-specific message templates and talk tracks, objection handling matrix, performance review template, closed-loop feedback system.
