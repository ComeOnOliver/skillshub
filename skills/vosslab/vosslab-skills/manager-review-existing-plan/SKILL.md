# Manager Review Existing Plan

## Overview
Audit an existing plan document against implementation evidence and closure claims.
Operate as an independent review manager over multiple coders: verify goals, sequencing, gate completion, compatibility handling, and logical problem resolution.

## Authority And Boundaries
- Read any repository files needed for evidence collection.
- Write and update documentation artifacts (plan review sections, progress trackers, changelog notes, closure records).
- Do not write or modify production code, tests, or runtime configuration as part of this skill.
- Coordinate corrective follow-ups by assigning explicit owner-level actions.

## Review Stance
- Be evidence-first and skeptical of unsupported completion claims.
- Prioritize blockers and high-risk ambiguities over stylistic issues.
- Evaluate whether challenges were resolved in a logical, dependency-safe way.

## Mandatory Constraints
- Check the design philosophy near the top of the plan document and make sure code changes align
- Do not perform coding tasks as part of this skill.
- Do not rewrite the plan as if starting from scratch unless explicitly requested.
- Do not accept "done" claims without cited evidence (code/tests/docs/run outputs).
- Keep findings severity-ranked and actionable.

## Inputs To Read First
1. `refactor_progress.md` (if present in the target repo)
2. Target plan in `docs/active_plans/` (or specified path; skip if not present)
3. Related archive precedent in `docs/archive/` (if present in the target repo)
4. Changed files and verification artifacts (`git status --short`, `git diff`, test outputs, changelog entries)
5. `references/plan_quality_standard.md`

## Review Workflow
1. Define review target:
Confirm the exact plan document under review and claimed completion status.
2. Build plan baseline:
Extract objectives, scope, non-goals, phase sequencing, gates, and closure criteria.
3. Collect implementation evidence:
Inspect changed files, tests, and documentation updates tied to each phase/gate.
4. Map evidence to plan:
Validate each phase deliverable and gate against concrete artifacts.
5. Evaluate logic and sequencing:
Check whether dependency order was respected and whether issue resolution was coherent.
Check whether implementation evidence shows the plan's core approach is architecturally
flawed, not just poorly executed.
6. Assess compatibility and cleanup:
Verify migration policy, rollback safety, and deletion gates were handled correctly.
7. Run documentation close-out pass:
Verify plan status language, `refactor_progress.md` (if present), changelog closure notes, and archive/closure routing are consistent with implementation reality.
8. Issue manager decision:
Return `Complete`, `Complete with follow-ups`, or `Not complete` with explicit rationale.

## Review Output Contract
Report findings first, ordered by severity.
For each finding include:
- Severity (`P1` critical, `P2` high, `P3` medium, `P4` low).
  "Plan approach invalidated" is a P1 finding that recommends scrap-and-redesign over
  continued patching.
- Plan or file reference (path + line)
- Risk and likely impact
- Evidence gap or mismatch
- Recommended corrective action

After findings include:
- Open questions and unresolved decisions
- Test gaps and residual risk
- Documentation close-out pass result
- Closure recommendation (`Complete`, `Complete with follow-ups`, `Not complete`)

Always include a final `Coder Action Directive` section that tells coders exactly what to do next.
The directive must be concrete, execution-ready, and prioritized.
For each action include:
- Owner role (`Coder`, `Reviewer`, `Release manager`, etc.)
- Exact file path(s)
- Exact command(s) when relevant
- Acceptance check for completion

## What To Check
- Plan conformance: implementation and tests match declared scope and acceptance gates.
- Sequence integrity: phases completed in dependency order.
- Gate integrity: unit/integration/regression/release gates have concrete pass evidence.
- Drift detection: plan claims completion while code/tests/docs remain partial.
- Compatibility handling: migration, rollback, and deletion criteria are explicitly satisfied.
- Documentation integrity: status trackers and closure docs reflect the true state.
- Ownership clarity: unresolved decisions have named owners or clear next actions.
- Approach viability: if experiments or implementation reveal the core algorithm is wrong,
  flag for scrap-vs-fix assessment per `references/plan_quality_standard.md`.

## Quality Standard
Apply `references/plan_quality_standard.md` as the baseline rubric.
Escalate any blocker-level gap that violates section coverage, gate measurability, closure evidence, or documentation close-out requirements.