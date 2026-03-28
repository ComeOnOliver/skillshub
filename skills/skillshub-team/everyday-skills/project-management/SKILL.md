# Project Management

Help users plan, execute, and track projects effectively.

## When to Use
- Creating project plans and timelines
- Sprint planning and backlog grooming
- Stakeholder status updates
- Task breakdown and estimation
- Risk identification and mitigation
- Resource planning

## When NOT to Use
- Meeting documentation (use meeting-notes)
- Financial planning (use budget-planner)
- Hiring workflows (use hiring-recruitment)

## Project Planning Framework

### 1. Project Charter (Start Here)
```
# Project Charter: [Project Name]

**Sponsor:** [Name]
**Project Lead:** [Name]
**Start Date:** [Date]
**Target Completion:** [Date]

## Problem Statement
[What problem are we solving?]

## Goals & Success Metrics
1. [Goal] — measured by [metric]
2. [Goal] — measured by [metric]

## Scope
**In scope:** [What's included]
**Out of scope:** [What's explicitly excluded]

## Key Stakeholders
| Name | Role | Interest | Influence |
|------|------|----------|-----------|
| [Name] | Sponsor | High | High |
| [Name] | End User | High | Low |

## Risks
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk] | High/Med/Low | High/Med/Low | [Plan] |

## Budget
[Estimated budget or resource allocation]
```

### 2. Work Breakdown Structure (WBS)
Break the project into manageable pieces:

```
Project
├── Phase 1: Discovery (Week 1-2)
│   ├── Stakeholder interviews
│   ├── Requirements gathering
│   └── Technical assessment
├── Phase 2: Design (Week 3-4)
│   ├── Solution design
│   ├── Prototype
│   └── Design review
├── Phase 3: Build (Week 5-8)
│   ├── Core features
│   ├── Integration
│   └── Testing
└── Phase 4: Launch (Week 9-10)
    ├── User training
    ├── Deployment
    └── Post-launch review
```

### 3. Task Estimation

**T-shirt sizing for initial estimates:**
- **XS:** < 2 hours
- **S:** 2-4 hours (half day)
- **M:** 1-2 days
- **L:** 3-5 days (one week)
- **XL:** 1-2 weeks (should be broken down further)

**Planning poker / Story points:**
- 1, 2, 3, 5, 8, 13, 21
- If it's > 13 points, break it into smaller tasks

### 4. Sprint Planning (Agile)

**Sprint Structure (2-week sprint):**
- Day 1: Sprint Planning (2 hours)
- Days 2-9: Development
- Day 9: Sprint Review / Demo (1 hour)
- Day 10: Retrospective (1 hour)

**Daily Standup (15 min):**
1. What did I complete yesterday?
2. What am I working on today?
3. Any blockers?

**Sprint Board Columns:**
- Backlog → To Do → In Progress → Review → Done

## Status Update Templates

### Weekly Status Report
```
# Weekly Status: [Project Name]
**Week of:** [Date] | **Overall Status:** 🟢 On Track / 🟡 At Risk / 🔴 Off Track

## Summary
[1-2 sentence overview of the week]

## Completed This Week
- ✅ [Task/milestone]
- ✅ [Task/milestone]

## In Progress
- 🔄 [Task] — [% complete, expected completion]
- 🔄 [Task] — [% complete, expected completion]

## Planned Next Week
- [ ] [Task]
- [ ] [Task]

## Risks & Blockers
- ⚠️ [Risk/blocker and mitigation plan]

## Key Metrics
- Tasks completed: X/Y
- Sprint velocity: Z points
- Budget spent: X% of total
```

### Executive Summary (Monthly)
```
# [Project Name] — Executive Summary
**Period:** [Month Year] | **Status:** 🟢/🟡/🔴

## Highlights
- [Major accomplishment]
- [Key milestone reached]

## Key Metrics
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Timeline | [Date] | [Date] | 🟢 |
| Budget | $X | $Y | 🟡 |
| Quality | [Target] | [Actual] | 🟢 |

## Decisions Needed
1. [Decision and options]

## Next Month Focus
- [Priority 1]
- [Priority 2]
```

## Gantt Chart Structure
```
| Task | Start | End | Duration | Dependencies | Owner |
|------|-------|-----|----------|--------------|-------|
| Requirements | W1 | W2 | 2 weeks | - | Alice |
| Design | W2 | W4 | 2 weeks | Requirements | Bob |
| Development | W4 | W8 | 4 weeks | Design | Team |
| Testing | W7 | W9 | 2 weeks | Development (partial) | QA |
| Launch | W9 | W10 | 1 week | Testing | Alice |
```

## Common Mistakes to Avoid
- No clear definition of "done"
- Skipping the project charter (scope creep follows)
- Tasks without owners or due dates
- Not tracking risks until they become problems
- Status reports that hide bad news
- Over-planning: plan in detail for 2-4 weeks ahead, high-level beyond that

