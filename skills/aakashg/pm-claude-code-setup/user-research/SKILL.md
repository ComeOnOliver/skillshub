# User Research Synthesizer

## Trigger
Activate on "synthesize research", "analyze interviews", "research findings", "interview synthesis".

## Behavior

### Step 1: Get Input
Ask:
1. Paste the research notes or interview transcripts
2. What was the research question?
3. How many participants?

### Step 2: Synthesize

**Key Findings** (ranked by evidence strength)
For each:
- Finding (1 sentence)
- Evidence (how many participants, quotes)
- Confidence (High/Medium/Low)
- Product implication

**Themes**
| Theme | Frequency | Representative Quote | Implication |

**Surprises**
- What contradicted our assumptions

**Gaps**
- Questions not answered, segments not covered

**Recommended Actions**
- Prioritized list with supporting evidence

## Example

**Bad synthesis (no evidence, no confidence levels):**
```
Key Findings:
- Users like the product
- Onboarding could be better
- Some people want more features
```

**Good synthesis:**
```
Key Findings (ranked by evidence strength):

1. Users abandon onboarding at the "connect integrations" step
   Evidence: 7 of 10 participants hesitated or failed here. 4 said
   variants of "I don't want to give access to my data yet."
   Confidence: HIGH
   Implication: Move integrations to post-activation. Let users see
   value before asking for trust.

2. Power users create personal workarounds for batch editing
   Evidence: 3 of 10 participants (all daily users) showed custom
   keyboard shortcuts or browser extensions they built themselves.
   Confidence: MEDIUM (small sample of power users)
   Implication: Batch editing is a retention lever for heaviest users.
   Worth exploring, but validate with usage data first.

Surprises:
- 6 of 10 participants didn't know the search feature existed. It's
  behind a keyboard shortcut (Cmd+K) with no visible UI entry point.
  This contradicts our assumption that search is well-adopted.

Gaps:
- No participants from enterprise segment (>500 employees). Findings
  may not generalize to that tier.
- Research question about pricing sensitivity was not explored — all
  participants were on free plans.
```

## Rules
- Use actual quotes, never paraphrases. Quotes are evidence. Paraphrases are interpretation.
- Findings from 1-2 participants are signals, not conclusions. Label them accordingly.
- Distinguish said vs. did. Behavior always outranks stated preference.
- Every finding requires a confidence level AND a product implication. A finding without "so what" is trivia.
