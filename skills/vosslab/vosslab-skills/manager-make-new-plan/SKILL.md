# Manager Make New Plan

## Overview
Build a manager-grade implementation plan that a coding team can execute with low ambiguity.
Operate as a planning manager over multiple coders: define scope, architecture boundaries, milestone delivery, gates, risk treatment, and rollout.

## Terminology Contract
Canonical definitions live in `references/DEFINITIONS.md`.
- Milestone: timeboxed planning unit with deliverables and gates. Use in docs only.
- Workstream: parallel lane inside a milestone. Ownable by one coder or a small pair.
- Work package: coder-sized chunk with acceptance criteria and verification commands.
- Patch: a reviewable code change set (PR-sized), used in summaries and changelog entries.
- Stage / Step / Pass: durable pipeline step or algorithm pass (allowed in code identifiers).
- Component / Module / Subsystem: durable code boundary (allowed in filenames, packages, tests).
- If you need a durable label in code, prefer component, module, stage, pass, feature, or contract.
- Legacy note: update older docs to use milestone terminology consistently.

## Terminology Collision
- Use Milestone / Workstream / Work package only in planning docs, never in code identifiers.
- Use Stage / Pass / Step for durable pipeline or algorithm steps; these are allowed in code identifiers.
- If a repository already has `phase3_*` filenames, treat "phase" there as legacy meaning "stage", and do not introduce new planning phases into code.
- Apply naming guardrails from `references/NAMING_GUARDRAILS.md`.

## Authority And Boundaries
- Read any repository files needed for planning context.
- Write and update documentation artifacts (plans, progress trackers, changelog notes, review notes).
- Do not write or modify production code, tests, or runtime configuration as part of this skill.
- Coordinate work for multiple coders through clear ownership and handoff boundaries.

## Planning Stance
- Think forward-first and solution-oriented.
- Optimize for feasible execution, not defensive critique.
- Keep ambition grounded by explicit acceptance gates and dependency-aware sequencing.

## Stabilization-First Rule
- Before proposing architecture or refactor plans, assess whether the current system works
  reliably on its target inputs.
- If core failures are unresolved, produce a stabilization plan instead:
  - At most 5 experiments, 2 success metrics.
  - Each experiment follows the proof ladder: observed failure, suspected cause, single change,
    success metric, revert criteria.
  - No new architecture until the current pipeline is stable.
- Do not mix abstraction levels: one document covers one of (a) root-cause debugging,
  (b) algorithm redesign, or (c) organizational program management.
- Refactor only after the algorithm works on the target dataset.
- Ban big-bang fixes: no template redesigns, new extractors, new matchers, new gates, migration
  layers, or compatibility paths while the core failure is not experimentally pinned down.
- After each stabilization cycle, assess whether fixes are converging or diverging.
- If 3+ experiments fail for the same architectural reason, the approach itself is wrong --
  scrap and redesign the algorithm before resuming incremental fixes.
- See scrap-vs-fix decision criteria in `references/plan_quality_standard.md`.

## Mandatory Constraints
- Make sure the plan has a clear design philosophy near the top to avoid drift
- Do not perform coding tasks as part of this skill.
- Do not include pseudo-complete promises without measurable acceptance criteria.
- Do not collapse architecture, implementation, and release concerns into one checklist.
- Keep milestone boundaries explicit, testable, and order-dependent.
- Apply numeric capacity and sizing targets from the capacity reference.
- Under Architecture Boundaries, require a mapping subsection: milestones and workstreams map to components and patches; components use durable terminology.
- Do not encode dependencies by milestone number. Dependencies must be declared by dependency ID in `Depends on`, with a short reason.
- Dependencies live at the work package level, not hidden inside milestone prose.
- Exception: if work is inherently serial (for example, one critical refactor), document why, and still create parallel work packages for tests, tooling, docs, and migration.
- A work package must be completable by one coder and result in at least one patch.
- Work is tracked and reported as patches with cadence and sizing rules from the capacity reference.
- In reports and changelog guidance, use "Patch 1", "Patch 2", etc.; reserve "change" for generic prose.

## Inputs To Read First
1. `refactor_progress.md` (if present in the target repo)
2. Active plan docs in `docs/active_plans/` (if present in the target repo)
3. Archive plan docs in `docs/archive/` (if present in the target repo)
4. `references/plan_quality_standard.md`
5. `references/DEFINITIONS.md`
6. `references/CAPACITY_AND_SIZING.md`
7. `references/NAMING_GUARDRAILS.md`
8. `references/EXECUTION_RESOURCES.md`

Use these inputs to match local planning style, terminology, status language, and quality bars.

## Workflow
1. Build context baseline:
If the repo has `refactor_progress.md`, read it to map active, completed, and pending work. Otherwise, skip this step.
2. Gather precedent:
If the repo has `docs/active_plans/` or `docs/archive/`, read the most relevant plans and extract reusable structure and known pitfalls. Otherwise, skip this step.
3. Define plan charter:
State objective, scope, non-goals, assumptions, constraints, and ownership boundaries.
4. Design milestone execution:
Define ordered milestones with dependencies, deliverables, and explicit done checks.
Milestone numbers are labels, not ordering. Ordering is defined by Depends on and Gates.
Declare dependencies by dependency ID with a short reason in `Depends on`; do not imply dependencies from milestone numbering.
Apply capacity and sizing targets from the capacity reference.
5. Define quality gates:
Add acceptance criteria, test strategy, rollback/safety considerations, and release gates.
6. Define migration and compatibility:
State additive rollout rules, backward compatibility promises, and legacy deletion criteria.
7. Build risk register:
List key risks with impact, trigger, owner, and mitigation.
8. Define documentation execution:
Specify required documentation updates per milestone (active plan, progress tracker, changelog, archive/closure notes). Use patch labels ("Patch 1", "Patch 2", ...) in implementation summaries and changelog-oriented sections.
9. Publish manager-grade output:
Deliver one execution-ready plan document with measurable closure criteria.

## Required Output Sections
- Title and objective
- Scope and non-goals
- Current state summary
- Architecture boundaries and ownership
- Mapping: milestones and workstreams map to components and patches. Components must be named with durable terminology.
- Milestone plan (ordered, dependency-aware)
- Workstream breakdown (for each workstream: Goal, Owner, Work packages [target ranges from capacity reference], Interfaces [needs/provides], Expected patches [count and rough grouping])
- Per-milestone deliverables and done checks (each milestone includes Depends on using dependency IDs with short reasons, plus Entry criteria and Exit criteria; use "none" when not applicable)
- Work package template (required for assignment-ready chunks): Work package title [verb + object], Owner (must reference a specific agent type from `references/EXECUTION_RESOURCES.md`), Touch points [files/components], Acceptance criteria, Verification commands, Dependencies [other work packages]
- Acceptance criteria and gates
- Test and verification strategy
- Migration and compatibility policy
- Risk register and mitigations
- Rollout and release checklist
- Documentation close-out requirements
- Patch plan and reporting format (required format: "Patch 1: [component] [intent]", "Patch 2: [component] [intent]", "Patch N: tests, migration, docs")
- Open questions and decisions needed

## Quality Standard
Apply the checklist in `references/plan_quality_standard.md`.
Reject or rewrite plan text that is vague, non-testable, or missing gate conditions.

## Plan Handoff
After the plan is published, execution uses adjacent skills:
- `parallel-plan` for lightweight parallelization of active work.
- `orchestrate-next-milestone` for end-to-end milestone delivery.
- `manager-review-existing-plan` for post-implementation audit.
- `gas-town-workflow` for role-mapped multi-agent coordination.
See `references/EXECUTION_RESOURCES.md` for the full lifecycle and agent catalog.

## Completion Criteria
Treat the planning task as complete only when:
- All required sections exist.
- Each milestone has concrete done checks.
- Acceptance gates are measurable.
- Migration/deletion policy is explicit.
- Documentation close-out requirements are explicit and assignable.
- Open decisions are enumerated with owner or decision-needed framing.
