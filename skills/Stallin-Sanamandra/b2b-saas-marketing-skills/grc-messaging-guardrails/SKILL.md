# GRC Messaging Guardrails

> Validate compliance and security terminology in B2B SaaS marketing copy. Prevent claim errors that
> erode credibility with CISOs, compliance managers, and security-aware buyers.

## Why This Skill Exists

GRC (Governance, Risk, and Compliance) buyers are domain experts. They will catch every terminology
mistake. A single error — calling SOC 2 a "certification" instead of an attestation, or claiming a
product "guarantees compliance" — destroys credibility with the exact audience you're trying to reach.

Most marketing teams making these errors aren't careless. They lack domain-specific validation
processes. This skill acts as that validation layer.

## When to Use This Skill

- Writing or reviewing ad copy that mentions compliance frameworks
- Creating landing pages for GRC/compliance products
- Drafting email sequences targeting CISOs, compliance managers, or security teams
- Building case studies that reference audit outcomes
- Reviewing AI-generated copy before publication
- Creating sales enablement content about compliance topics
- Writing blog posts or thought leadership about security/compliance

## When NOT to Use This Skill

- General SaaS marketing copy with no compliance references
- Internal documentation not intended for external audiences
- Product/engineering documentation (different accuracy standards apply)
- Legal documents (requires actual legal review, not marketing validation)

---

## Terminology Dictionary

### Framework Classification (CRITICAL)

These are the most frequently confused terms in GRC marketing. Get these wrong and your buyer knows
you don't understand their world.

| Framework | Correct Classification | Common Error | Why It Matters |
|-----------|----------------------|--------------|----------------|
| **SOC 2** | Attestation (or examination/report) | ~~Certification~~ | SOC 2 is issued by a CPA firm as an attestation report, not a certification body. CISOs know this instantly. |
| **SOC 1** | Attestation (or examination/report) | ~~Certification~~ | Same as SOC 2 — CPA attestation, not certification. |
| **ISO 27001** | Certification | ~~Compliance~~ | Issued by accredited certification bodies. "ISO 27001 certified" is correct. "ISO 27001 compliant" is weaker but acceptable. |
| **ISO 27701** | Certification (extension to 27001) | ~~Standalone standard~~ | Always reference as extension: "ISO 27701 (privacy extension to ISO 27001)" |
| **GDPR** | Regulation | ~~Certification~~ ~~Standard~~ | EU regulation. Companies comply with GDPR; they are not "GDPR certified." |
| **HIPAA** | Regulation (US federal law) | ~~Certification~~ ~~Standard~~ | There is no official HIPAA certification. Companies can be "HIPAA compliant" but not "HIPAA certified." |
| **PCI DSS** | Standard | ~~Regulation~~ ~~Certification~~ | Payment Card Industry Data Security Standard. Compliance is validated, not certified. Use "PCI DSS compliant." |
| **CCPA/CPRA** | Regulation (California state law) | ~~Standard~~ | State privacy regulation. Companies comply; they are not certified. |
| **NIST CSF** | Framework | ~~Standard~~ ~~Regulation~~ | Voluntary framework. Companies "align with" or "adopt" NIST CSF. They don't "comply with" it (it's not mandatory). |
| **NIST 800-53** | Publication/Controls catalog | ~~Certification~~ | Required for FedRAMP. Use "implements NIST 800-53 controls," not "NIST 800-53 certified." |
| **FedRAMP** | Authorization program | ~~Certification~~ | Companies receive FedRAMP "authorization," not "certification." |
| **CSA STAR** | Certification program | ~~Compliance~~ | Cloud Security Alliance program. "CSA STAR certified" is correct at Level 2. Level 1 is self-assessment only. |
| **CIS Controls** | Best practice framework | ~~Standard~~ ~~Regulation~~ | Companies "implement" or "align to" CIS Controls. |

### Correct Usage Patterns

```
✅ "Achieve SOC 2 attestation"
✅ "Complete your SOC 2 examination"  
✅ "Get your SOC 2 report"
✅ "Obtain ISO 27001 certification"
✅ "Maintain GDPR compliance"
✅ "Demonstrate HIPAA compliance"
✅ "Align with NIST CSF"

❌ "Get SOC 2 certified"
❌ "Achieve SOC 2 compliance certification"
❌ "GDPR certified"
❌ "HIPAA certification"
❌ "NIST compliant"
❌ "PCI certified"
```

### Commonly Confused Terms

| Term | Correct Usage | Incorrect Usage |
|------|--------------|-----------------|
| **Audit** | An examination by a qualified assessor. SOC 2 audits are performed by CPA firms. ISO audits by accredited CBs. | Don't use "audit" and "assessment" interchangeably — they have different legal/professional meanings. |
| **Assessor vs. Auditor** | SOC 2: auditor (CPA). ISO 27001: auditor (CB). Penetration test: assessor. | Mixing these signals unfamiliarity with the audit process. |
| **Controls** | Technical or administrative safeguards. "Implement controls" or "map controls." | Don't say "install controls" or "activate controls." Controls aren't software features. |
| **Compliance** | State of meeting requirements. Always relative to a specific standard/regulation. | Never use "fully compliant" without specifying the framework. Avoid "100% compliant" — implies permanence. |
| **Continuous compliance** | Ongoing monitoring and maintenance of compliance posture. | Don't imply it means "never out of compliance." It means continuous monitoring, not perfection. |
| **Risk** | Potential impact × likelihood. Always contextual. | Don't use "risk" and "vulnerability" interchangeably. A vulnerability is a weakness; a risk includes the probability and impact of exploitation. |
| **Posture** | Overall security/compliance state. "Security posture" or "compliance posture." | Acceptable in marketing. Avoid "compliance score" unless you actually provide a numerical score. |

---

## Claim Validation Rules

### NEVER Make These Claims

These claims are factually incorrect or legally problematic. Flag and rewrite immediately.

| Banned Claim | Why | Suggested Rewrite |
|-------------|-----|-------------------|
| "Guarantees compliance" | No tool can guarantee compliance. Compliance depends on organizational controls, processes, and human behavior. | "Accelerates your path to compliance" or "Streamlines compliance workflows" |
| "Automates compliance" (unqualified) | Misleading. Tools automate evidence collection, monitoring, and workflows — not the entirety of compliance. | "Automates evidence collection and compliance monitoring" |
| "Get compliant in X days" (absolute) | Timelines vary by org size, complexity, and readiness. Absolute claims invite legal risk. | "Companies typically achieve [framework] readiness in X-Y weeks" (with supporting data) |
| "100% compliant" | Compliance is continuous, not binary. This implies a permanent state. | "Maintain continuous compliance posture" |
| "Replace your auditor" | Tools supplement, never replace, qualified auditors. This claim undermines buyer trust. | "Reduce audit preparation time by X%" |
| "One platform for all frameworks" | Implies equal depth across all frameworks. Buyers know this is unrealistic. | "Supports [X] frameworks including [list specific ones]" |
| "No-code compliance" | Oversimplifies. Implementation always requires configuration and domain decisions. | "Streamlined setup with minimal technical overhead" |
| "Hack-proof" / "Breach-proof" | No product can make this claim. Immediate credibility killer. | "Strengthens your security posture" or "Reduces attack surface" |

### Claims That Require Qualification

These claims are acceptable with proper context. Flag if used without qualification.

| Claim | Required Qualification |
|-------|----------------------|
| "Reduces audit time" | Must specify: by how much, based on what data, for which framework. E.g., "Reduces SOC 2 audit prep time by 60% based on customer data (n=50)." |
| "Saves X hours" | Must cite source: customer survey, case study, or internal benchmark. |
| "Trusted by X companies" | Must be verifiable. Specify segment if possible: "Trusted by 500+ SaaS companies." |
| "Faster than [competitor]" | Must have documented basis. Comparative claims require defensible evidence. |
| "AI-powered" | Must specify what the AI does. "AI-powered risk assessment" is acceptable. "AI-powered compliance" is vague. |
| "Enterprise-grade" | Must be backed by specific capabilities: SSO, RBAC, SOC 2 Type II of your own product, uptime SLAs, etc. |

### Claims That Are Safe

| Claim Pattern | Example |
|--------------|---------|
| Workflow description | "Automates evidence collection across [X] integrations" |
| Customer proof (attributed) | "Reduced audit prep from 8 weeks to 2 weeks — [Customer Name], [Title]" |
| Capability statement | "Maps controls across SOC 2, ISO 27001, and GDPR simultaneously" |
| Risk-first framing | "Identify compliance gaps before your auditor does" |
| Time-value | "Get audit-ready faster with automated evidence collection" |
| Outcome-focused | "Close enterprise deals faster with trust documentation" |

---

## Narrative Framing Rules

### Lead With Risk, Not Features

GRC buyers are motivated by risk reduction, not feature excitement. Every piece of copy should answer:
"What bad thing does this help me avoid?" before "What good thing does this help me achieve?"

```
❌ Feature-first: "Our platform automates SOC 2 evidence collection with 150+ integrations."
✅ Risk-first:    "Manual evidence collection is the #1 reason SOC 2 audits take 3x longer than 
                   they should. Automate it across 150+ integrations."

❌ Feature-first: "AI-powered risk assessment dashboard."  
✅ Risk-first:    "Your board wants a risk score. Your spreadsheet can't give them one. Get 
                   real-time risk visibility your leadership team actually trusts."

❌ Feature-first: "Multi-framework compliance management platform."
✅ Risk-first:    "Managing SOC 2, ISO 27001, and GDPR in separate spreadsheets means one 
                   framework is always out of date. Unify them."
```

### Buyer Persona Tone Calibration

| Persona | What They Care About | Tone | Avoid |
|---------|---------------------|------|-------|
| **CISO** | Risk reduction, board reporting, incident preparedness, vendor risk | Technical, strategic, peer-level. Never condescending. | Marketing fluff, vague claims, basic security explanations they already know. |
| **GRC Manager / Compliance Lead** | Audit efficiency, evidence gaps, framework coverage, workflow reduction | Practical, operational, empathetic to daily pain. | Strategic vision statements — they want tactical help. |
| **CTO / VP Engineering** | Integration ease, engineering time not wasted on compliance, API quality | Technical depth, developer-friendly, low-friction messaging. | "No-code" claims, non-technical feature descriptions. |
| **CFO / Procurement** | ROI, cost of non-compliance, vendor consolidation, time-to-value | Business case, quantified outcomes, risk-as-cost framing. | Technical jargon, feature lists, compliance acronym soup. |

### Enterprise Trust Signals

In order of credibility impact for GRC buyers:

1. **Named customer quotes with title and company** (highest trust)
2. **Specific metrics from customer deployments** (e.g., "60% faster audit prep")
3. **Analyst recognition** (Gartner, Forrester, G2 category leader)
4. **Your own compliance posture** (your SOC 2 Type II report, ISO 27001 cert)
5. **Customer count with segment specificity** ("500+ SaaS companies" > "trusted by many")
6. **Integration count** (signals depth of evidence automation)
7. **Framework count** (signals breadth, but only if each is genuinely supported)

---

## Validation Checklist

Run this checklist on every piece of marketing copy before publication.

### Terminology Check
- [ ] Every framework is classified correctly (attestation/certification/regulation/standard/framework)
- [ ] "SOC 2" never appears next to "certification" or "certified"
- [ ] "HIPAA" and "GDPR" never appear next to "certification" or "certified"
- [ ] "ISO 27001" uses "certification" (not "attestation" or "compliance")
- [ ] "Compliance" always specifies which framework
- [ ] "Controls" are not described as product features or software to install

### Claim Check
- [ ] No absolute guarantees ("guarantees compliance," "100% compliant," "hack-proof")
- [ ] All time-based claims are qualified with source data
- [ ] All comparative claims have documented evidence
- [ ] "AI-powered" specifies what the AI actually does
- [ ] Customer proof points are attributed and approved for use
- [ ] No claims that the product replaces auditors or legal counsel

### Narrative Check
- [ ] Copy leads with risk/pain, not features
- [ ] Persona-appropriate tone (not condescending to CISOs, not overly technical for CFOs)
- [ ] No hype words: "revolutionary," "game-changing," "unprecedented," "cutting-edge" (GRC buyers tune these out)
- [ ] No excessive em dashes in copy
- [ ] No AI-written patterns: "In today's landscape," "It's worth noting," "navigating the complex world of"

### Proof Check
- [ ] Trust signals are ordered by credibility (named quotes > metrics > logos)
- [ ] Customer logos have explicit usage permission
- [ ] Case study metrics are current and verified
- [ ] Your own compliance certifications are listed (practice what you preach)

---

## Examples

### Ad Copy Validation

**Input (flagged):**
> "Get SOC 2 certified in 2 weeks. Our AI-powered platform guarantees compliance and replaces the
> need for expensive auditors. Trusted by hundreds of companies."

**Output (corrected):**
> "Get SOC 2 audit-ready in as little as 2 weeks. Automate evidence collection with AI-powered
> monitoring and reduce audit prep time by 60%. Trusted by 500+ SaaS companies including
> [Customer A] and [Customer B]."

**Corrections applied:**
1. "certified" → "audit-ready" (SOC 2 is an attestation, not a certification)
2. "guarantees compliance" → "automate evidence collection" (no tool guarantees compliance)
3. "replaces the need for auditors" → "reduce audit prep time" (tools supplement, not replace)
4. "hundreds of companies" → "500+ SaaS companies" (specific > vague)
5. Added named customers for trust signal hierarchy

### Landing Page Headline Validation

**Input (flagged):**
> "The All-in-One Compliance Certification Platform"

**Output (corrected):**
> "Compliance Automation for Growing SaaS Teams"

**Corrections applied:**
1. "Certification Platform" conflates compliance with certification — most frameworks don't involve certification
2. "All-in-One" is a hype claim without substance — replaced with specific audience
3. Added "Growing SaaS Teams" for ICP specificity

---

## Integration Notes

### With Other Skills
- **Copywriting skills:** Run this guardrails check AFTER copy is drafted, as a validation layer
- **Ad creative skills:** Apply before any ad copy goes to paid platforms
- **Email sequence skills:** Validate every email in a nurture sequence — terminology errors compound
- **Case study skills:** Apply the Proof Check section to validate all metrics and quotes

### With Brand Context
For best results, upload alongside this skill:
- Your company's message house or positioning document
- An approved terminology glossary (extends this skill's dictionary)
- A list of approved customer quotes and metrics
- Your competitor positioning guidelines (what you can/cannot say about competitors)

---

## Changelog

- **v1.0** (March 2026): Initial release. Terminology dictionary, claim validation, narrative framing, validation checklist.