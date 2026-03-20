---
name: finalize-and-commit
description: >
  Finalize code changes for production readiness by removing duplicate logic,
  auditing hardcoded values, verifying build integrity, and structuring
  clean commits with Conventional Commits format.
license: MIT
compatibility:
  - Claude Code
  - Cursor
metadata:
  type: execution
  category: cleanup
  maturity: stable
  estimated_time: 15 min
---

# Skill: Finalize Changes and Commit (Cleanup, Deduplication, Hardcoded Audit)

**Type:** Execution

## Purpose

Finalize current changes for production readiness.

Tasks:

- Remove duplicate logic
- Eliminate unnecessary code
- Audit and resolve hardcoded values
- Ensure consistency and build integrity
- Prepare structured commits

---

## When to Use

- Before committing finalized work to a shared branch
- Before submitting a pull request for review
- After completing a refactoring session that touched multiple files
- When preparing a clean commit history from messy working changes

---

## When NOT to Use

- Work-in-progress code that is still actively being developed
- Trivial single-line fixes (typo, formatting) that need no audit
- Initial prototyping or exploratory coding phases
- Changes already reviewed and approved through another skill

---

## Inputs Required

Do not run this skill without:

- [ ] Working tree with uncommitted or staged changes
- [ ] Access to project build, lint, and test commands
- [ ] Knowledge of project commit conventions (if any)

Optional but recommended:

- [ ] Target branch context (e.g., main, release)
- [ ] List of intended change scope (files or modules)

---

## Output Format

1. Issues Found
2. Actions Taken
3. Verification Results
4. Commit Plan
5. Final Commit Messages

---

## Procedure

### Gate 0 – Working Set Validation

> **CRITICAL:** The working tree may contain changes from other agent sessions
> or manual edits. This gate must isolate *only* the current session's changes
> without disturbing anything else.

**Step 0-1: Identify current session scope**

- Review the conversation history and edit history of this session.
- Build an explicit list of files that were created, modified, or deleted
  *by this session*.
- If the user provided a scope list (files or modules), use that as the
  authoritative source.

**Step 0-2: Inspect full working tree state**

- Run `git status` and `git diff --name-only` to enumerate all uncommitted
  changes in the working tree.

**Step 0-3: Classify changes**

- **In-scope:** Files that appear in both the session scope (Step 0-1)
  and the working tree (Step 0-2).
- **Out-of-scope:** Files that appear in the working tree but were NOT
  modified by this session. These may belong to other agent sessions,
  manual edits, or background tooling.

**Step 0-4: Protect out-of-scope changes**

- **NEVER** revert, restore, checkout, stash, or discard out-of-scope changes.
- Out-of-scope files must be left exactly as they are in the working tree.
- The only correct action is to *exclude* them from staging (`git add`).

**Step 0-5: Confirm with the user**

- Present a summary to the user:
  - Files to be committed (in-scope)
  - Files left untouched (out-of-scope), if any
- Proceed only after the user confirms the commit target set.
- Validate that new/deleted in-scope files do not break entrypoints.

---

### Gate 1 – Duplicate & Dead Code Detection

> **SCOPING RULE:** Focus analysis on **in-scope files only** (from
> Gate 0). When checking for duplicates, search for similar patterns
> in the immediate module/directory first, then expand to adjacent
> modules only if duplication signals are found.

- Identify repeated logic blocks
  - If repeated ≥ 3 times → extract helper
  - Avoid over-abstraction
- Remove:
  - Unused variables
  - Dead branches
  - Debug prints
  - Stale TODOs without references

---

### Gate 2 – Hardcoded Value Audit

> **SCOPE ADJUSTMENT:** If all in-scope changes are limited to test
> files, documentation, or type definitions, perform a quick scan
> (search for numeric literals and string constants in the diff)
> instead of a full classification audit. The full audit is required
> when production logic files are in scope.

Classify hardcoded values into:

A) Algorithmic constants → Extract to named constant + documentation  
B) Operational policies → Move to config/env + default fallback  
C) Test-only values → Restrict to test scope

Ensure:

- No hidden policy decisions remain hardcoded
- Retry limits, timeouts, thresholds are explicit

---

### Gate 3 – Consistency & Quality Review

Verify:

- Error handling patterns consistent
- Logging structure aligned with project conventions
- No PII/secrets exposed
- Public interface compatibility preserved
- No accidental performance regression

---

### Gate 4 – Verification Proof

Run relevant project checks:

- Tests
- Lint
- Typecheck
- Build

If failures occur:

- Fix root cause
- Do not silence or bypass checks

---

### Gate 5 – Commit Structuring

**Staging rule:** Stage only in-scope files confirmed in Gate 0.
Use `git add <specific-file>` for each file individually.
Never use `git add .`, `git add -A`, or `git add --all`.

Separate commits logically:

1. Refactor (no behavior change)
2. Functional change
3. Tests / documentation

Use Conventional Commits:

- fix(scope):
- feat(scope):
- refactor(scope):
- test(scope):
- docs(scope):
- chore(scope):

Each commit must explain:

- What changed
- Why it changed
- Risk considerations (if any)
- Test proof

---

## Guardrails

- Do not silence or bypass failing checks.
- Do not combine unrelated changes in a single commit.
- Do not over-abstract when extracting helpers (repeated ≥ 3 times threshold).
- Explicitly state assumptions when classifying hardcoded values.
- If context is insufficient to determine intent, ask for clarification.
- Do not remove code without verifying it is truly unused.
- Respect existing project conventions for commit messages and structure.
- **NEVER** use `git checkout -- <file>`, `git restore`, `git stash`, `git reset --hard`,
  or any other command that discards or reverts uncommitted changes to files
  outside the current session's scope. Other sessions or agents may own those changes.
- **NEVER** use `git add .`, `git add -A`, or `git add --all`. Always stage files
  individually with `git add <specific-file>` to avoid accidentally including
  out-of-scope changes.
- Working tree changes from other sessions, agents, or manual edits must be
  left completely untouched.

---

## Failure Patterns

Common bad outputs:

- Lumping all changes into a single large commit without logical separation
- Skipping build/lint/test verification before committing
- Ignoring hardcoded values because they "look fine"
- Over-extracting helpers for code repeated only once or twice
- Removing code that appears dead but is used via reflection or dynamic imports
- Producing commit messages that describe "what" but not "why"
- Reverting or discarding uncommitted changes that belong to other sessions or agents
- Using `git add .` or `git add -A` which accidentally stages out-of-scope changes
- Treating "ensure no unintended changes" as "revert unrelated files" instead of "exclude from staging"

---

## Example 1 (Minimal Context)

**Input:**

3 files changed: a utility function was refactored, an unused import was found, and a debug `console.log` was left in.

**Output:**

1. Issues Found: unused import in `utils/parse.ts`, debug log in `api/handler.ts`
2. Actions Taken: removed unused import, removed debug log
3. Verification Results: lint pass, tests pass, build pass
4. Commit Plan: single refactor commit (scope is small)
5. Final Commit Messages: `refactor(utils): clean up unused import and debug log`

---

## Example 2 (Realistic Scenario)

**Input:**

12 files changed across 3 modules. Includes a retry timeout hardcoded as `3000`, duplicated validation logic in 4 handlers, and a new API endpoint.

**Output:**

1. Issues Found: hardcoded retry timeout (3000ms) in `services/retry.ts`, duplicated input validation in 4 route handlers, unused helper `formatLegacy` in `utils/format.ts`
2. Actions Taken: extracted retry timeout to config (`RETRY_TIMEOUT_MS`), created shared `validateInput()` helper, removed `formatLegacy`
3. Verification Results: all tests pass, lint pass, typecheck pass, build pass
4. Commit Plan: 3 commits — (a) refactor: extract shared validation, (b) refactor: move retry timeout to config, (c) feat: add new API endpoint
5. Final Commit Messages:
   - `refactor(validation): extract shared validateInput helper from route handlers`
   - `refactor(retry): move hardcoded timeout to config as RETRY_TIMEOUT_MS`
   - `feat(api): add POST /items endpoint with input validation`

---

## Notes

**FAST MODE** (only if explicitly requested):

- Skip deep hardcoded classification
- Allow single commit only if scope is small
