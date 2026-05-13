---
name: calendar-builder
description: Build a complete social media publishing calendar from a campaign goal, date range, audience, channels, and content constraints. Use when planning a week, month, launch window, or ongoing period of scheduled content.
tags:
  - social-media
  - calendar
  - campaign-planning
  - agentreacher-compatible
---

# Calendar Builder

Turn strategy and draft ideas into a scheduling-ready content calendar. Optimize for sequence, channel fit, and sustainable cadence, not maximum volume.

## Inputs

- date range or number of weeks
- campaign goal
- audience
- channels
- content pillars or themes
- existing assets
- constraints: approval windows, excluded dates, time zones, required CTAs

If cadence is missing, choose a conservative default and state it.

## Workflow

1. Define the campaign arc:
   introduce the problem, teach the method, show proof, handle objections, repeat the CTA.

2. Allocate posts across pillars:
   avoid clustering too many sales, proof, or education posts together.

3. Choose platform-specific slots:
   assign date, time, platform, angle, format, CTA, asset, and approval status.

4. Add sequence logic:
   note which posts depend on earlier posts and which can stand alone.

5. Mark gaps:
   list missing assets, claims needing verification, and posts that need human review.

## Taste Rules

- A calendar should feel intentional when read week by week.
- Do not fill every empty slot just because the period is long.
- Keep each post's job clear: awareness, education, proof, objection, conversion, or community.
- Avoid repeating the same CTA on consecutive posts unless it is launch day.
- Include evergreen fallback posts for risky or asset-dependent slots.

## Output Format

```md
## Calendar Strategy
- Period:
- Goal:
- Cadence:
- Primary CTA:

## Publishing Calendar
| Date | Time | Platform | Pillar | Angle | Format | CTA | Asset | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

## Sequence Notes
- [dependency or rationale]

## Missing Inputs
- [asset, claim, approval, or scheduling constraint]
```

## AgentReacher Notes

Designed to work well before AgentReacher scheduling. The table can be turned into posts, review tasks, or scheduled drafts.

Example usage in AgentReacher: "Build a 30-day calendar for our AgentReacher launch across X, Instagram, Facebook, LinkedIn, TikTok, YouTube, Pinterest, Threads, and Bluesky."
