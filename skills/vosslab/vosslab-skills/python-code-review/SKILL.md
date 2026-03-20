# Python Code Review

## Workflow
1. Verify `AGENTS.md`, `docs/REPO_STYLE.md`, `docs/PYTHON_STYLE.md`, and `docs/CHANGELOG.md` exist.
2. Read those files and summarize repo rules in four one-sentence lines with prefixes:
`AGENTS:`, `REPO_STYLE:`, `PYTHON_STYLE:`, `CHANGELOG:`.
3. Inspect changed files first (`git diff`, `git status --short`), then inspect related call sites.
4. If the repo has `docs/active_plans/`, identify the active plan document(s) that govern the change. Otherwise, skip plan-conformance steps.
5. If an active plan exists, map code and tests to plan requirements, acceptance criteria, and stated constraints. Otherwise, skip this step.
6. Prioritize findings by severity: plan mismatch/regressions (if applicable), correctness/safety, then maintainability.
7. Provide concrete, minimal fixes with before/after examples when a fix is straightforward.
8. Flag uncertainty explicitly and ask targeted review questions for unclear logic or contracts.

## Review Output Contract
- Report findings first, ordered by severity.
- For each finding include:
  - Severity (`P1` critical, `P2` high, `P3` medium, `P4` low)
  - File path and line reference
  - Risk and likely impact
  - Recommended change
- After findings, include:
  - Open questions
  - Test gaps and residual risk
  - Brief summary

## What To Check
- Plan conformance: implementation and tests match active plan scope, ordering, and acceptance criteria.
- Plan drift: behavior changed without corresponding plan/changelog updates, or plan claims complete while code is partial.
- Correctness: edge cases, off-by-one logic, stale assumptions, API misuse, compatibility breaks.
- Security: unsafe eval/exec, command injection, path traversal, deserialization hazards, weak validation.
- Maintainability: dead code, hidden coupling, unclear naming, duplicated logic, brittle tests.
- Performance only when materially relevant.

## Fix Guidance
- Prefer small, local edits that preserve behavior unless a bug requires behavior change.
- Keep fixes aligned with repo Python style and test conventions.
- Add or adjust tests for each behavior-changing fix.