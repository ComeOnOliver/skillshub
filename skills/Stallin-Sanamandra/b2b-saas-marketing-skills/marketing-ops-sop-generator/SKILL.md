# Marketing Ops SOP Generator

> A sequential system for building, auditing, and maintaining marketing operations
> infrastructure. Each phase produces documentation that the next phase depends on.
> Phase 8 runs continuously to catch drift before it becomes debt.

## Why This Skill Exists

Marketing ops at most B2B SaaS companies isn't broken in dramatic ways. It's broken
in slow, invisible ways that compound until someone asks a question nobody can answer:

- "Why do we have 47 different UTM source values for LinkedIn?"
- "Which of these 200 HubSpot workflows is still active and which should have been
  turned off six months ago?"
- "A lead came in from our top ABM account 3 days ago and nobody followed up.
  Where did it go?"
- "We changed the lead scoring model last month. Did anyone tell the BDR team?"

The pattern is always the same: someone built something, didn't document it, left
or moved on, and now nobody knows how it works or whether it's still correct. Every
undocumented process is a liability that gets more expensive to fix the longer it runs.

This skill encodes the SOPs that prevent this drift. Not by creating documentation
for its own sake, but by building the minimum viable governance that keeps campaign
tracking clean, lead routing reliable, and system changes auditable.

## When to Use This Skill

- Setting up marketing ops for a new team or company
- Auditing existing marketing ops for gaps and inconsistencies
- Standardizing campaign naming conventions across geos and teams
- Building or fixing UTM tracking governance
- Creating QA checklists for campaign launches
- Documenting lead routing logic and SLA requirements
- Building incident response playbooks for marketing system failures
- Onboarding a new marketing ops hire or handoff between team members
- Cleaning up HubSpot (or equivalent MAP) after years of ungoverned changes
- Preparing for a CRM migration or MAP integration

## When NOT to Use This Skill

- Campaign strategy or creative development (this is infrastructure, not content)
- Attribution modeling or pipeline reporting (use Pipeline Attribution Narrator)
- ABM program design (use ABM Program Orchestrator)
- BDR outreach or sales enablement (use BDR Enablement Generator)
- One-off campaign setup (this is systems-level, not campaign-level)
- CRM admin or technical implementation (this is process design, not configuration)

---

## The Marketing Ops SOP Pipeline: 8 Sequential Phases

```
PHASE 1              PHASE 2              PHASE 3              PHASE 4
Ops Audit &      →   Naming &         →   Lead Management  →   Campaign Launch
Gap Assessment        Taxonomy              & Routing            QA System

     ↓                                                              ↓

PHASE 8              PHASE 7              PHASE 6              PHASE 5
Continuous       ←   Change            ←   Incident         ←   Tool & Access
Drift Detection      Management            Response              Governance

     ↓
     └──→ PHASE 1 (quarterly re-audit)
```

**The continuous loop:** Phase 8 runs ongoing checks against the standards set in
Phases 1-7. When drift is detected (new untagged campaigns, broken workflows,
undocumented changes), it triggers a targeted fix rather than waiting for a
quarterly audit to catch it.

---

## Phase 1: Ops Audit & Gap Assessment

**Input:** Access to MAP (HubSpot), CRM, ad platforms, analytics tools
**Output:** Marketing ops health scorecard with prioritized gaps

### Marketing Ops Health Scorecard

Score each area before building any SOPs. You can't fix what you haven't diagnosed.

```
MARKETING OPS HEALTH SCORECARD

Team: ________________
Date: ________________
Scored by: ________________

SCORING: 1 = No process exists | 2 = Informal/tribal knowledge |
3 = Documented but not enforced | 4 = Documented and followed |
5 = Documented, followed, and audited regularly

AREA                                          SCORE    NOTES
─────────────────────────────────────────────────────────────
Campaign naming convention                    [ /5]    _______________
UTM parameter governance                      [ /5]    _______________
Lead lifecycle definitions                    [ /5]    _______________
Lead routing logic                            [ /5]    _______________
Lead scoring model                            [ /5]    _______________
Form strategy & management                    [ /5]    _______________
Workflow documentation                        [ /5]    _______________
List hygiene & segmentation                   [ /5]    _______________
Tool access & permissions                     [ /5]    _______________
Campaign QA process                           [ /5]    _______________
Reporting & dashboard governance              [ /5]    _______________
Change management process                     [ /5]    _______________
Incident response procedures                  [ /5]    _______________
Onboarding documentation                      [ /5]    _______________
─────────────────────────────────────────────────────────────
TOTAL                                         [ /70]

PRIORITY GAPS (score 1 or 2):
1. _________________________________
2. _________________________________
3. _________________________________

IMMEDIATE ACTION (the single most damaging gap):
_________________________________
```

### Prioritization Framework

Not all ops gaps are equal. Prioritize by business impact, not by ease of fixing.

| Priority | Criteria | Examples |
|----------|----------|---------|
| **P0: Fix this week** | Directly losing pipeline or misattributing revenue | Broken lead routing (leads not reaching sales). UTM tracking so inconsistent that attribution data is unusable. |
| **P1: Fix this month** | Causing regular errors that require manual cleanup | No campaign naming convention (can't segment reports). Lead scoring model outdated (BDRs getting bad leads). |
| **P2: Fix this quarter** | Creating tech debt that will get worse over time | Undocumented workflows. No change management process. Duplicate properties in HubSpot. |
| **P3: Build when capacity allows** | Nice to have but not causing active damage | Comprehensive onboarding docs. Automated QA checks. Dashboard governance. |

---

## Phase 2: Naming & Taxonomy

**Input:** Gap assessment (Phase 1), list of active campaigns, current naming patterns
**Output:** Naming convention standard + UTM governance document

### Campaign Naming Convention

A naming convention is only useful if it's enforceable, parseable, and adopted.
Three rules:

1. **Machine-parseable.** If you can't split the name by delimiter and extract
   each component programmatically, it's not a convention. It's a suggestion.
2. **Human-readable.** A team member should look at the name and understand the
   campaign without clicking into it.
3. **Enforced at creation, not at reporting.** If people can create campaigns
   without following the convention, they will.

### Naming Convention Template

```
CAMPAIGN NAMING CONVENTION

Format:
[Year]-[Geo]-[Segment]-[Channel]-[Type]-[Name]-[Variant]

Components:
─────────────────────────────────────────────────────
COMPONENT     VALUES                      EXAMPLE
─────────────────────────────────────────────────────
Year          YYYY                        2026
Geo           NAEU | APAC | GLOBAL        NAEU
Segment       C1 | C2 | ALL              C2
Channel       LI | GG | FB | EM |        LI
              WEB | EV | DM | CS |
              SEO | REF | ABM
Type          PAID | ORG | NUR |         PAID
              WBN | WP | CS | EV
Name          Descriptive, no spaces     soc2-audit-readiness
              Use hyphens as separators
Variant       A | B | CTRL (optional)    A
─────────────────────────────────────────────────────

Examples:
2026-NAEU-C2-LI-PAID-soc2-audit-readiness-A
2026-APAC-C1-EM-NUR-iso27001-onboarding
2026-GLOBAL-ALL-WEB-ORG-compliance-roi-calculator
2026-NAEU-C2-ABM-PAID-fintech-ciso-awareness

Channel codes:
LI = LinkedIn          GG = Google Ads       FB = Meta/Facebook
EM = Email             WEB = Website         EV = Events
DM = Direct mail       CS = Content synd.    SEO = Organic search
REF = Referral         ABM = ABM program     PR = PR/Earned

Type codes:
PAID = Paid campaign   ORG = Organic         NUR = Nurture
WBN = Webinar          WP = Whitepaper       CS = Case study
EV = Event             LP = Landing page
```

### UTM Governance

UTMs are the connective tissue between campaign activity and attribution data.
Inconsistent UTMs make attribution unreliable. Unreliable attribution leads to
bad budget decisions.

```
UTM PARAMETER STANDARD

─────────────────────────────────────────────────────────
PARAMETER       RULE                        EXAMPLES
─────────────────────────────────────────────────────────
utm_source      Platform name, lowercase    linkedin, google, hubspot,
                No variations allowed       facebook, direct-mail,
                                            g2, trustradius

utm_medium      Channel type, lowercase     paid-social, paid-search,
                Controlled vocabulary       cpc, email, organic-social,
                                            display, content-syndication,
                                            referral, event

utm_campaign    Campaign name from naming   2026-naeu-c2-li-paid-
                convention, lowercase       soc2-audit-readiness

utm_content     Ad/asset variant            ciso-pain-v1, banner-a,
                                            ebook-cover-blue

utm_term        Keyword (paid search only)  soc2-compliance-software
─────────────────────────────────────────────────────────

ENFORCEMENT RULES:
1. All lowercase. No exceptions. "LinkedIn" and "linkedin" are different
   values in every analytics platform.
2. No spaces. Use hyphens as separators.
3. utm_source and utm_medium use a controlled vocabulary. New values
   require approval and documentation.
4. utm_campaign must match the HubSpot campaign name.
5. Every link in every paid campaign, email, and external content must
   have UTMs. No exceptions.
6. Internal links (site navigation, help docs) never get UTMs. UTMs on
   internal links break attribution by overwriting the original source.
```

### UTM Audit Checklist

Run monthly. Takes 30 minutes. Prevents 30 hours of cleanup later.

- [ ] Export all utm_source values from GA4/HubSpot. Check for duplicates and typos.
- [ ] Export all utm_medium values. Verify against controlled vocabulary.
- [ ] Check the 10 most recent paid campaigns for correct UTM formatting.
- [ ] Verify no internal links have UTM parameters.
- [ ] Confirm utm_campaign values match HubSpot campaign names.
- [ ] Check for any campaigns running without UTMs (especially new ad sets).

---

## Phase 3: Lead Management & Routing

**Input:** Naming convention (Phase 2), CRM/MAP access, sales team structure
**Output:** Lead lifecycle definition, routing logic, SLA documentation

### Lead Lifecycle Definitions

Define once, enforce everywhere. Every team (marketing, BDR, sales) must use the
same definitions. Disagreement on what "qualified" means is the #1 cause of
marketing-sales friction.

```
LEAD LIFECYCLE STAGES

─────────────────────────────────────────────────────────────────────
STAGE          DEFINITION                     OWNER    ENTRY CRITERIA
─────────────────────────────────────────────────────────────────────
Subscriber     Known contact, no intent       MKT      Form fill (content
               signal                                  download, newsletter)

Lead           Engaged contact, fits           MKT      Meets minimum
               minimum firmographic                     firmographic criteria
               criteria                                 (company size, industry)

MQL            Lead scoring threshold          MKT      Score >= [threshold].
               reached                                  Combination of fit +
                                                        engagement signals.

SAL            Accepted by BDR/sales for       BDR      BDR confirms contact
               follow-up                                is reachable and
                                                        account fits ICP

SQL            Qualified through               BDR      BANT or MEDDIC
               discovery conversation                   qualification criteria
                                                        confirmed on call

SQO            Sales-qualified opportunity     SALES    Opportunity created in
               with defined next steps                  CRM with stage, amount,
                                                        and close date

Closed Won     Deal signed                    SALES    Contract executed

Closed Lost    Deal lost                      SALES    Reason documented
                                                        in CRM

Disqualified   Does not meet criteria          ANY      Reason documented.
                                                        Not deleted from CRM.

Recycled       Previously engaged, not         MKT      Returned from BDR/sales
               ready now                                with reason. Re-enters
                                                        nurture.
─────────────────────────────────────────────────────────────────────
```

### Lead Routing Logic

Document the actual routing rules, not the intended ones. Then fix the gap.

```
LEAD ROUTING RULES

INBOUND LEADS (form fills, demo requests, contact us):
1. Lead enters HubSpot via form submission
2. Enrichment runs (company size, industry, geo) [tool: ________]
3. Lead scoring evaluates fit + intent
4. Routing decision:

   IF demo request or "contact sales":
     → Route to BDR within [X] minutes (SLA: ________)
     → Assignment: [round-robin / territory / named account]
     → Notification: [Slack channel / email / both]

   IF content download or webinar registration:
     → Enter nurture sequence
     → Monitor for scoring threshold
     → Route to BDR when MQL threshold reached

   IF from ABM target account:
     → Flag as ABM lead in CRM
     → Route to assigned ABM BDR immediately (SLA: ________)
     → Notify ABM program owner

   IF disqualified (below company size, wrong geo, competitor):
     → Auto-disqualify with reason
     → Do not route to BDR
     → Add to exclusion list for paid campaigns

OUTBOUND LEADS (BDR-sourced):
1. BDR creates lead in CRM from outbound prospecting
2. Lead tagged with source = "outbound" and BDR name
3. If meeting booked: BDR completes qualification fields
4. If qualified: BDR creates opportunity and hands off to AE

ROUTING EXCEPTIONS:
- Enterprise accounts (>500 employees): route to [named AE/team]
- Existing customers: route to CSM, not BDR
- Partner/referral leads: route to [partner manager]
```

### Lead Routing SLA

| Lead Type | Routing SLA | First Touch SLA | Escalation |
|-----------|-------------|-----------------|------------|
| Demo request | < 5 minutes (automated) | < 1 hour (BDR response) | If no response in 2 hours, reassign + alert manager |
| Contact us (high intent) | < 5 minutes | < 2 hours | If no response in 4 hours, reassign |
| MQL (score threshold) | < 15 minutes | < 24 hours | If no response in 48 hours, reassign |
| ABM target account | < 5 minutes | < 1 hour | Immediate Slack alert to ABM BDR + manager |
| Content download | No routing (enters nurture) | N/A | N/A |

### Lead Scoring Model Documentation

Don't just build the model. Document it so the next person can understand and
maintain it.

```
LEAD SCORING MODEL

Last updated: [Date]
Updated by: [Name]
Next review: [Date + 90 days]

FIT SCORING (demographic/firmographic):
────────────────────────────────────────
ATTRIBUTE         CRITERIA              POINTS
────────────────────────────────────────
Company size      50-500 employees      +20
                  10-50 employees       +10
                  <10 or >500           +0
Industry          SaaS, FinTech,        +15
                  HealthTech
                  Other tech            +5
                  Non-tech              -10
Title             CISO, CTO, VP Eng,    +20
                  Compliance Mgr
                  Director level        +10
                  Individual contrib.   +0
Geo               NA, EU, ANZ           +10
                  India, APAC           +5

ENGAGEMENT SCORING (behavioral):
────────────────────────────────────────
ACTION                         POINTS    DECAY
────────────────────────────────────────
Demo request                   +50       None
Pricing page visit             +25       30 days
Case study download            +15       30 days
Webinar attended               +15       60 days
Blog post view (3+)            +10       30 days
Email click                    +5        14 days
Email open                     +1        7 days
Webinar registered (no show)   +5        30 days
Unsubscribe                    -30       None
No activity 60 days            -20       Reset on activity

MQL THRESHOLD: [X] points
Review: Quarterly, based on MQL-to-SQL conversion rate.
If <30% of MQLs convert to SQL, threshold is too low.
If >70% convert, threshold may be too high (leaving leads on table).
```

---

## Phase 4: Campaign Launch QA System

**Input:** Naming convention (Phase 2), lead routing (Phase 3)
**Output:** Pre-launch QA checklist, post-launch verification process

### Pre-Launch QA Checklist

Every campaign goes through this before it goes live. No exceptions. Catching
an error before launch costs 5 minutes. Catching it after costs hours plus
whatever budget was wasted on broken tracking.

```
CAMPAIGN LAUNCH QA CHECKLIST

Campaign name: ________________________________
Launched by: __________________________________
QA'd by: ______________________________________
Date: _________________________________________

TRACKING & ATTRIBUTION
[ ] Campaign name follows naming convention
[ ] HubSpot campaign created and linked
[ ] UTM parameters set correctly on all links
[ ] UTMs tested (click through and verify in GA4 real-time)
[ ] Attribution source mapping confirmed in CRM
[ ] No UTMs on internal links

TARGETING
[ ] Audience matches intended segment (C1/C2/geo)
[ ] Exclusion lists applied (competitors, existing customers,
    disqualified leads, current open opportunities)
[ ] Frequency caps set (if applicable)
[ ] Geo targeting matches campaign scope

CONTENT & CREATIVE
[ ] All compliance terminology validated (GRC Messaging Guardrails)
[ ] Landing page loads correctly on mobile and desktop
[ ] Form fields map to correct CRM properties
[ ] Thank-you page / confirmation email working
[ ] No broken links in any asset
[ ] Legal disclaimer / privacy policy present where required

LEAD FLOW
[ ] Form submission triggers correct workflow
[ ] Lead routing tested with test submission
[ ] BDR notification confirmed (Slack/email)
[ ] Lead scoring updated if new engagement types added
[ ] Test lead deleted from CRM after verification

BUDGET & SCHEDULING
[ ] Daily/total budget set correctly
[ ] Start and end dates confirmed
[ ] Bid strategy configured
[ ] Budget pacing monitored for first 24 hours

SIGN-OFF
[ ] Campaign owner confirms all checks passed
[ ] If any check failed, issue documented and resolved before launch
```

### Post-Launch Verification (First 24 Hours)

| Check | Timing | What to Verify |
|-------|--------|----------------|
| Data flowing | 2 hours after launch | Impressions/clicks/submissions appearing in platform and HubSpot |
| UTM accuracy | 2 hours | GA4 real-time shows correct source/medium/campaign |
| Lead routing | First submission | Test or real submission routed to correct BDR within SLA |
| Budget pacing | 6 hours | Spend rate within expected range (not blowing daily budget in 2 hours) |
| Error check | 12 hours | No 404s on landing pages, no form errors, no broken workflows |
| Performance baseline | 24 hours | CTR, CPC, conversion rate within expected range for the channel |

---

## Phase 5: Tool & Access Governance

**Input:** Audit of current tool stack and access levels
**Output:** Tool inventory, access policy, admin documentation

### Marketing Tool Inventory

Document every tool in the marketing stack. Not just the ones you pay for.
Include free tools, browser extensions, and integrations that touch marketing data.

```
MARKETING TOOL INVENTORY

Last updated: [Date]
Next review: [Quarterly]

─────────────────────────────────────────────────────────────────────────
TOOL            CATEGORY    OWNER     ADMINS        COST/YR   CONTRACT
                                                              RENEWAL
─────────────────────────────────────────────────────────────────────────
HubSpot         MAP/CRM     [Name]    [Names]       $____     [Date]
Google Ads      Paid        [Name]    [Names]       Variable  N/A
LinkedIn CM     Paid        [Name]    [Names]       Variable  N/A
GA4             Analytics   [Name]    [Names]       Free      N/A
Google Tag Mgr  Tracking    [Name]    [Names]       Free      N/A
[ABM platform]  ABM         [Name]    [Names]       $____     [Date]
[Intent data]   Data        [Name]    [Names]       $____     [Date]
[Enrichment]    Data        [Name]    [Names]       $____     [Date]
Slack           Comms       [Name]    [Names]       $____     [Date]
Canva/Figma     Creative    [Name]    [Names]       $____     [Date]
─────────────────────────────────────────────────────────────────────────
```

### Access Policy

| Access Level | Who Gets It | What They Can Do | Approval Required |
|-------------|-------------|------------------|-------------------|
| **Admin** | Marketing ops lead, 1 backup | Full configuration, workflow creation/deletion, integration management, user management | VP Marketing approval |
| **Power user** | Campaign managers, demand gen leads | Create campaigns, build workflows, manage lists, edit properties | Marketing ops approval |
| **Standard** | Marketing team members | Create content, view reports, send emails (within existing workflows) | Manager approval |
| **View only** | Sales leadership, BDR managers, executives | View dashboards and reports. No edit access. | Marketing ops approval |
| **Integration** | API keys, connected tools | Specific scoped access for data sync | Marketing ops + IT approval |

### Access Review Process

- **Frequency:** Quarterly
- **Triggered by:** Employee departure, role change, or quarterly calendar
- **Steps:**
  1. Export all users with access to each tool
  2. Cross-reference against current employee list
  3. Remove access for departed employees (should also be automated on offboarding)
  4. Review access levels against current roles
  5. Document any changes made

---

## Phase 6: Incident Response

**Input:** Tool inventory (Phase 5), lead routing logic (Phase 3)
**Output:** Incident response playbooks for common marketing system failures

### Marketing Incident Categories

| Severity | Definition | Response Time | Examples |
|----------|-----------|---------------|---------|
| **SEV 1: Pipeline impact** | Leads not routing, forms broken, tracking completely down | < 30 minutes | Lead routing workflow broken. Main demo form returning errors. HubSpot integration with CRM disconnected. |
| **SEV 2: Data quality impact** | Attribution broken, duplicate leads, scoring malfunction | < 4 hours | UTMs not tracking. Lead scoring assigning wrong values. Duplicate workflow running. |
| **SEV 3: Campaign impact** | Individual campaign broken, but others unaffected | < 24 hours | Single landing page 404. One ad set targeting wrong audience. Email sent to wrong list. |
| **SEV 4: Minor issue** | Cosmetic or non-urgent, no active damage | Next business day | Dashboard not updating. Report formatting broken. Non-critical integration sync delayed. |

### Incident Response Playbooks

#### SEV 1: Lead Routing Failure

```
INCIDENT: Leads not routing to BDR team

DETECTION:
- BDR reports no new leads in [X] hours
- HubSpot workflow error notification
- Monitoring alert (if configured)

IMMEDIATE (first 30 minutes):
1. Check HubSpot workflow status (active/errored/turned off)
2. Check for recent changes to the workflow (who edited it, when)
3. If workflow errored: identify the error, fix, re-enroll affected leads
4. If workflow turned off: re-activate, investigate who turned it off
5. Manually route any leads stuck in queue

VERIFICATION:
1. Submit a test lead through each form
2. Confirm test lead arrives in correct BDR queue within SLA
3. Confirm notification fires (Slack/email)
4. Delete test lead

COMMUNICATION:
1. Notify BDR manager that leads may have been delayed
2. Provide list of affected leads with timestamps
3. Confirm BDRs follow up on delayed leads within 2 hours

POST-INCIDENT:
1. Document: what broke, when, how long leads were affected, root cause
2. Quantify impact: how many leads were delayed, estimated pipeline impact
3. Preventive action: what changes prevent recurrence
4. Add to monitoring if not already tracked
```

#### SEV 1: Form Failure

```
INCIDENT: Primary conversion form returning errors or not submitting

IMMEDIATE (first 30 minutes):
1. Test the form yourself (submit with test data)
2. Check HubSpot form status and recent edits
3. Check landing page for code changes or deployment issues
4. If form is broken: activate backup form or redirect to alternative
5. If landing page is down: check hosting, deploy cached version

VERIFICATION:
1. Successful test submission
2. Data appearing in HubSpot
3. Routing workflow triggered
4. Confirmation email sent

QUANTIFY IMPACT:
1. Time window: when did the form break vs. when was it fixed
2. Traffic during window: how many visitors hit the page
3. Lost submissions estimate: (traffic × typical conversion rate)
4. Pipeline impact estimate: (lost submissions × MQL rate × SQO rate × ACV)
```

#### SEV 2: Attribution Breakdown

```
INCIDENT: UTM tracking broken or attribution data missing

DETECTION:
- GA4 showing spike in (direct) / (none) traffic
- HubSpot campaigns showing no new contacts
- Monthly report shows attribution gap

DIAGNOSIS:
1. Check the 5 highest-traffic campaigns for correct UTMs
2. Check Google Tag Manager for recent changes
3. Check for redirect chains stripping UTM parameters
4. Check GA4 filters for misconfiguration

FIX:
1. Correct UTMs on affected campaigns
2. Revert GTM changes if applicable
3. Note: historical data cannot be backfilled. Document the gap period
   and exclude from trend analysis.

PREVENTION:
1. Add UTM verification to campaign launch QA (Phase 4)
2. Set up GA4 alert for (direct)/(none) traffic exceeding baseline by 20%
```

#### SEV 3: Wrong Email Sent to Wrong List

```
INCIDENT: Marketing email sent to unintended recipients

IMMEDIATE (first 1 hour):
1. Pause/cancel the send if still in progress
2. Determine: who received it, how many, and what the content was
3. Assess harm: is the content embarrassing, inaccurate, or harmful?
4. If harmful/inaccurate: send correction email to affected list
5. If benign: generally better not to send a follow-up drawing attention to it

POST-INCIDENT:
1. Root cause: wrong list selected, smart list criteria wrong, workflow error
2. Document: who sent it, what approval process was followed, where it broke
3. Prevention: add list verification step to email QA, require two-person
   sign-off for sends over [X] contacts
```

---

## Phase 7: Change Management

**Input:** All existing SOPs (Phases 1-6)
**Output:** Change management process for marketing ops modifications

### Change Management Rules

Marketing ops changes without documentation create the exact mess Phase 1
was designed to audit. Prevent it with a lightweight change process.

```
MARKETING OPS CHANGE LOG

Rule: Any change to the following requires a log entry BEFORE the change is made:
- Workflow creation, modification, or deletion
- Lead scoring model changes
- Lead routing logic changes
- Property creation or modification in HubSpot/CRM
- Integration changes (new connections, modified sync rules)
- List criteria changes for active campaigns
- Form field changes on high-traffic pages
- UTM convention changes

NOT required for:
- Publishing a new email or blog post (covered by campaign QA)
- Adjusting ad bid amounts or budgets
- Minor copy edits in existing content
- Pulling reports or exporting data
```

### Change Log Template

```
CHANGE LOG ENTRY

Date: ________________
Made by: ________________
Reviewed by: ________________ (required for SEV 1-2 systems)

WHAT CHANGED:
[Specific description. Not "updated workflow." Instead: "Modified lead
routing workflow 'Inbound Demo Request' to add APAC geo filter and
route APAC leads to [BDR name] instead of round-robin."]

WHY:
[Business reason. Not "to fix it." Instead: "APAC demo requests were
routing to NAEU BDR team, causing 24-48 hour response delays due to
timezone gap."]

WHAT IT AFFECTS:
[Downstream impact. "All inbound demo requests from APAC IP addresses
will now route to APAC BDR queue. NAEU routing is unchanged."]

ROLLBACK PLAN:
[How to undo this if it breaks something. "Revert workflow to version
[X] saved on [date]. APAC leads would return to round-robin pool."]

VERIFICATION:
[How you confirmed it works. "Submitted test lead from APAC IP.
Confirmed routing to APAC BDR queue within 3 minutes. Confirmed NAEU
test lead still routes correctly."]
```

### Change Approval Matrix

| Change Type | Approval Required | Review Required |
|------------|-------------------|-----------------|
| New workflow creation | Marketing ops lead | Peer review before activation |
| Workflow modification (active, >100 contacts/month) | Marketing ops lead | Peer review + test before activation |
| Workflow modification (low volume or inactive) | Self-approval | Document in change log |
| Lead scoring model change | Marketing ops + BDR manager | 2-week parallel run before full switch |
| New CRM property | Marketing ops lead | Check for duplicates first |
| Integration change | Marketing ops + IT | Test in sandbox if available |
| UTM convention change | Marketing ops lead | Communicate to all campaign managers before effective date |

---

## Phase 8: Continuous Drift Detection

**Input:** Standards from Phases 1-7
**Output:** Ongoing monitoring and automated/manual checks

### Monthly Ops Health Check

Block 2 hours on the first Monday of each month. Non-negotiable.

```
MONTHLY OPS HEALTH CHECK

Date: ________________
Completed by: ________________

UTM AUDIT (30 minutes)
[ ] Exported utm_source values. New/unexpected values: ________________
[ ] Exported utm_medium values. New/unexpected values: ________________
[ ] Spot-checked 5 recent campaigns for UTM accuracy
[ ] No internal links with UTMs found

LEAD ROUTING AUDIT (30 minutes)
[ ] Submitted test lead through primary form. Routed correctly: Y/N
[ ] Checked SLA compliance for past 30 days. Average response time: ____
[ ] Reviewed unassigned/stuck leads. Count: ____
[ ] Checked for leads that bypassed routing (manual CRM entry without
    proper source tagging)

WORKFLOW AUDIT (30 minutes)
[ ] Listed all active workflows. Count: ____
[ ] Identified workflows with errors in past 30 days. Count: ____
[ ] Reviewed workflows created in past 30 days. All documented: Y/N
[ ] Checked for conflicting workflows (two workflows targeting same
    criteria with different actions)

DATA HYGIENE (30 minutes)
[ ] Duplicate contact check. New duplicates found: ____
[ ] Contacts with no lifecycle stage. Count: ____
[ ] Contacts with missing critical properties (company, title). Count: ____
[ ] Bounced email addresses cleaned from active lists

ISSUES FOUND:
1. _________________________________ Priority: P__
2. _________________________________ Priority: P__
3. _________________________________ Priority: P__

ACTIONS TAKEN:
1. _________________________________
2. _________________________________
3. _________________________________
```

### Quarterly Deep Audit

The monthly check catches drift. The quarterly audit catches structural issues.

| Audit Area | What to Review | Action if Failed |
|-----------|----------------|------------------|
| **Lead scoring** | Compare MQL-to-SQL conversion rate vs. prior quarter. If below 30%, scoring is too loose. Above 70%, too tight. | Adjust thresholds, review point values with BDR team |
| **Campaign naming** | Export all campaigns. Calculate % following convention. Target: 95%+. | Retrain offenders, consider enforcing at creation level |
| **Tool access** | Cross-reference user lists with current employees. | Remove departed employees, audit permission levels |
| **Workflow inventory** | Count active workflows. Compare to prior quarter. Identify unused ones. | Deactivate workflows with 0 enrollments in 90 days |
| **Property cleanup** | List all custom properties created in quarter. Check for duplicates or unused. | Merge duplicates, archive unused (don't delete if historical data exists) |
| **Integration health** | Check all active integrations for sync errors. | Fix sync issues, document any data gaps created |

---

## Integration Notes

### With Other Skills in This Repo

- **GRC Messaging Guardrails:** Phase 4 (Campaign Launch QA) requires compliance
  terminology validation before any campaign goes live. The QA checklist explicitly
  references the guardrails skill. Every ad, email, and landing page that mentions
  SOC 2, ISO 27001, HIPAA, or other frameworks should be checked.

- **Pipeline Attribution Narrator:** The UTM governance and campaign naming standards
  in Phase 2 are foundational to the attribution models in the narrator skill.
  Inconsistent UTMs produce unreliable attribution. Fix naming first, then build
  attribution models on clean data.

- **ABM Program Orchestrator:** Phase 3 lead routing must include ABM-specific rules.
  When a lead from an ABM target account comes in, routing should flag it as ABM,
  bypass standard round-robin, and go directly to the assigned ABM BDR. The
  orchestrator's Phase 5 (channel orchestration) depends on clean tracking from
  the naming convention and UTM standards here.

- **BDR Enablement Generator:** The lead scoring model in Phase 3 determines which
  leads BDRs receive. If scoring is wrong, BDRs waste time on bad leads and the
  enablement skill's sequences target the wrong accounts. Phase 7 performance
  reviews from the BDR skill should feed back into scoring model updates here.

### With Your Tech Stack

- **HubSpot:** This skill assumes HubSpot as the MAP. Campaign naming maps to
  HubSpot Campaign objects. Workflow documentation maps to HubSpot Workflows.
  Lead scoring maps to HubSpot Contact scoring properties. If using a different
  MAP, adapt the property names but keep the process logic.

- **Google Analytics 4:** UTM governance feeds GA4 source/medium/campaign
  dimensions. The monthly UTM audit uses GA4 exports. Set up GA4 alerts for
  anomalous (direct)/(none) traffic as an early warning for broken tracking.

- **Google Tag Manager:** Many tracking issues originate in GTM changes. Include
  GTM in the change management process (Phase 7). Version history in GTM is your
  audit trail.

- **Slack:** Incident response (Phase 6) and lead routing notifications should
  flow through dedicated Slack channels. Suggested channels: #mktg-ops-alerts
  (automated notifications), #mktg-ops-changes (change log entries),
  #lead-routing-alerts (SLA breach notifications).

---

## Common Marketing Ops Mistakes

| Mistake | What Happens | How to Avoid |
|---------|-------------|--------------|
| **No naming convention** | 200 campaigns with names like "Q3 campaign v2 FINAL" and nobody can segment reports | Phase 2. Enforce at creation. |
| **UTMs set once, never audited** | Attribution data silently degrades over months. Leadership decisions based on bad data. | Monthly UTM audit (Phase 8). Takes 30 minutes. |
| **Lead scoring built and forgotten** | Model reflects buyer behavior from 18 months ago. BDRs receive leads that no longer convert. | Quarterly scoring review tied to MQL-to-SQL conversion rate. |
| **Everyone is a HubSpot admin** | Workflows conflict, properties duplicate, nobody knows who changed what. | Access policy (Phase 5). Max 2-3 admins. |
| **No QA before campaign launch** | Broken forms, wrong UTMs, and misrouted leads discovered after budget is spent. | Phase 4 checklist. Every campaign. No exceptions. |
| **Incident response is "figure it out"** | Form breaks on Friday evening. Nobody knows who to contact or what to check. | Phase 6 playbooks. Severity levels. Named owners. |
| **Changes made without documentation** | Person who built the workflow leaves. Nobody knows what it does or why. | Phase 7 change log. Lightweight, not bureaucratic. |
| **Monthly ops check skipped "because we're busy"** | Drift accumulates. By the time someone notices, it's a P0 cleanup project. | Block the calendar. 2 hours. First Monday. Non-negotiable. |

---

## Validation Checklist

Run this before declaring your marketing ops SOPs complete.

### Foundation
- [ ] Ops health scorecard completed with current scores
- [ ] Top 3 gaps identified and prioritized
- [ ] Campaign naming convention documented and communicated to all campaign creators
- [ ] UTM governance document published with controlled vocabulary
- [ ] UTM audit completed on current campaigns

### Lead Management
- [ ] Lead lifecycle stages defined and agreed upon by marketing, BDR, and sales
- [ ] Lead routing logic documented and tested
- [ ] Lead routing SLAs defined and monitoring in place
- [ ] Lead scoring model documented with point values, thresholds, and decay rules
- [ ] MQL-to-SQL conversion rate baseline captured

### Launch & Governance
- [ ] Campaign launch QA checklist created and shared with all campaign managers
- [ ] Post-launch verification process defined
- [ ] Tool inventory completed with owners and admin contacts
- [ ] Access policy documented and quarterly review scheduled
- [ ] Incident response playbooks created for SEV 1-2 scenarios

### Operations
- [ ] Change management process documented and communicated
- [ ] Change log template accessible to all marketing ops users
- [ ] Monthly ops health check calendar blocked and recurring
- [ ] Quarterly deep audit scheduled
- [ ] Onboarding document created for new marketing ops team members

---

## Changelog

- **v1.0** (March 2026): Initial release. 8-phase sequential pipeline, ops health scorecard, naming and UTM governance, lead lifecycle and routing, campaign QA system, tool governance, incident response playbooks, change management process, continuous drift detection.