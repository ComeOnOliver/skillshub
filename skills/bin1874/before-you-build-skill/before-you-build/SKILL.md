---
name: before-you-build
description: Review product and feature risk before an AI coding agent starts implementation.
---

# Before You Build

Don't ask AI to build it yet. Ask why it might fail first.

## When to Use

Use this skill before building or changing a product, feature, SaaS, AI app, side project, or startup idea.

Use it when the user asks:

- "Is this worth building?"
- "Should I add this feature?"
- "Will anyone want this?"
- "Sanity-check this idea before implementation."
- "The requirements changed. Should we still build it?"

## Prerequisites

No API keys or external services are required.

If live evidence would improve the review, ask the user whether they want you to search for similar products, competitor complaints, communities, or demand signals.

## Workflow

First, do not write code, scaffold a project, recommend a tech stack, or create an implementation plan.

Review whether the idea should move into implementation at all.

If the idea is too broad, ask the user to complete this sentence:

```text
This tool is for [specific people], in [specific situation], to solve [specific problem].
```

If the current alternative is missing and the review would be too speculative, ask:

```text
How do they solve this today, and why is that not good enough?
```

Ask at most two questions before giving a constrained review.

Then produce a short Quick Reality Check:

```markdown
## Quick Reality Check

Assumption:
- [State the assumption if any.]

Verdict:
- Don't build yet / Build smaller / Build only if / Build small

Biggest risk:
- [The most important likely failure mode.]

Most likely problem:
- [Demand / distribution / pricing / positioning / retention / trust.]

What to validate first:
- [One concrete test before implementation.]

Smallest useful version:
- [A narrower version worth testing.]
```

## Common Patterns

For a new product idea, check whether the user has a narrow buyer, specific situation, painful problem, current alternative, and reachable distribution channel.

For a feature request, check whether it comes from repeated demand, a paying segment, a retention blocker, or only a loud edge case.

For a requirement change or pivot, check whether the change improves validated demand or only expands scope.

For a learning or portfolio project, do not judge by startup standards. Keep the scope small and focus on the learning artifact.

## Gotchas

Do not reward vague AI app ideas with implementation plans.

Do not treat "a competitor exists" as proof of demand.

Do not treat friends saying "cool idea" as validation.

Do not turn the review into a long questionnaire.

Do not block all building. The useful outcome may be "build smaller" or "validate this narrow version first."

Full project:
https://github.com/bin1874/before-you-build-skill
