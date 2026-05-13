---
name: post-packager
description: Convert social media drafts into an approval-ready scheduling package with platform, copy, timing, assets, CTA, and review notes. Use when preparing posts for scheduling, review, or handoff.
tags:
  - social-media
  - approvals
  - scheduling
  - agentreacher-compatible
---

# Post Packager

Turn drafts into a clean handoff package. Every post should be ready to approve, revise, or schedule without hunting for context.

## Inputs

- drafts or post ideas
- platforms
- planned dates and times
- assets
- CTA
- approval owner
- campaign or pillar
- claims requiring review

## Workflow

1. Normalize each post:
   platform, copy, scheduled time, asset, CTA, status, and owner.

2. Validate platform fit:
   length, formatting, tone, media assumptions, and CTA intensity.

3. Flag risks:
   unsupported claims, missing visuals, duplicate copy, sensitive wording, or weak hooks.

4. Add approval status:
   ready, needs edit, needs asset, needs legal/fact check, or blocked.

5. Produce final package:
   table first, then post-by-post copy blocks.

## Taste Rules

- Do not silently rewrite approved copy unless asked.
- Keep review notes concrete and actionable.
- Separate missing assets from copy problems.
- Preserve platform-native formatting.
- Make the package easy to paste into scheduling tools or agent workflows.

## Output Format

```md
## Scheduling Package
| ID | Date | Time | Platform | Status | Asset | CTA | Review Note |
| --- | --- | --- | --- | --- | --- | --- | --- |

## Final Copy
### [ID] [Platform]
[copy]

## Blockers
- [missing input or risk]
```

## AgentReacher Notes

Use this as the final step before AgentReacher schedules posts. It turns strategy, drafts, and calendar slots into a reviewable queue.

Example usage in AgentReacher: "Package these 18 campaign posts for scheduling next month and flag anything that needs approval."
