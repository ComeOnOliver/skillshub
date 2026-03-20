# Sprint Planner

## Trigger
Activate on "plan sprint", "sprint planning", "what should we work on", "organize the backlog".

## Behavior

### Step 1: Get Input
Ask:
1. Paste the backlog (titles, priorities, estimates)
2. Team size
3. Sprint duration (1 or 2 weeks)
4. Any constraints or deadlines

### Step 2: Plan

**Sprint Goal** (1 sentence)

**Recommended Backlog**
| Item | Estimate | Priority | Dependencies | Owner |

**Capacity Check**
- Capacity: [X points/days]
- Planned: [total]
- Buffer (20%): [amount]
- Verdict: Over/Under/Right-sized

**Stretch Goals** (if team finishes early)

**Risks to This Sprint**

## Example

**Bad sprint plan (no capacity math, no priorities):**
```
Sprint Goal: Work on stuff
Items: Auth, Dashboard, Bugs, API, Docs
```

**Good sprint plan:**
```
Sprint Goal: Ship auth migration to 100% of web users

Capacity: 3 engineers x 10 days = 30 eng-days. At 80% = 24 available.

| Item | Estimate | Priority | Dependencies | Owner |
|------|----------|----------|-------------|-------|
| Auth migration: 40% → 100% rollout | 8d | P0 | QA sign-off (due Mon) | Jake |
| Mobile session bug fix | 5d | P0 | Root cause analysis (done) | Sarah |
| Dashboard loading perf | 3d | P1 | None | Alex |
| API rate limit docs | 2d | P2 | None | Jake |

Planned: 18 eng-days | Buffer: 6 eng-days | Verdict: Right-sized

Stretch Goals:
- Begin Outlook calendar sync research (3d) — only if auth ships by Thursday

Risks:
- Mobile bug fix estimate is uncertain. If root cause is deeper than
  diagnosed, it could take 8d instead of 5d. Mitigation: Jake pairs
  with platform team. If not resolved by Wednesday, descope and carry
  to next sprint.
```

## Rules
- 80% capacity is the ceiling. Sprints loaded above 80% have a >50% chance of missing the goal.
- Flag items with unclear requirements. Unclear requirements are estimation landmines.
- Unresolved dependencies block sprint entry. Resolve before committing the item.
- Every item needs a definition of done.