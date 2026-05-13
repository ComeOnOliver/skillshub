---
name: cadence-planner
description: Choose a practical social media posting cadence by channel, campaign period, audience, available assets, and review capacity. Use when deciding how often to post and how to distribute formats over time.
tags:
  - social-media
  - cadence
  - scheduling
  - agentreacher-compatible
---

# Cadence Planner

Set a realistic publishing rhythm. The cadence should be ambitious enough to learn, but light enough to maintain quality and approvals.

## Inputs

- channels
- period length
- campaign goal
- team capacity
- asset availability
- approval process
- minimum and maximum posting frequency
- time zone or audience geography

## Workflow

1. Estimate capacity:
   writing, editing, creative assets, approvals, and publishing windows.

2. Choose a channel mix:
   primary channels get original posts; secondary channels get adapted or lighter posts.

3. Assign weekly frequency:
   split by platform, format, and pillar.

4. Add time slots:
   use sensible daypart assumptions and mark them as adjustable if no data is available.

5. Add constraints:
   rest days, approval cutoff, asset deadlines, and launch-day exceptions.

## Taste Rules

- Fewer high-quality posts beat a brittle high-volume plan.
- Cadence should match the buyer journey and platform norms.
- Do not recommend video frequency unless there is production capacity.
- Treat launches differently from evergreen periods.
- State assumptions instead of pretending to know best posting times.

## Output Format

```md
## Recommended Cadence
| Platform | Weekly Posts | Formats | Role | Notes |
| --- | --- | --- | --- | --- |

## Weekly Rhythm
| Day | Platform | Post Type | Time Window | Approval Cutoff |
| --- | --- | --- | --- | --- |

## Assumptions
- [assumption]
```

## AgentReacher Notes

Use this before AgentReacher scheduling to decide how many posts the agent should create and where the calendar needs human review.

Example usage in AgentReacher: "Plan a realistic 6-week cadence for X, Instagram, Facebook, LinkedIn, TikTok, YouTube, Pinterest, Threads, and Bluesky with two hours of review time per week."
