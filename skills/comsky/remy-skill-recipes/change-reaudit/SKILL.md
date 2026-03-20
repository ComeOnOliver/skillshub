---
name: change-reaudit
description: >
  Re-audit code changes to identify side effects, regression risks,
  and unhandled edge cases before merging or deploying.
license: MIT
compatibility:
  - Claude Code
  - Cursor
metadata:
  type: execution
  category: review
  maturity: stable
  estimated_time: 10 min
---

# Skill: Change Re-Audit (Side Effects, Regression, Edge Cases)

**Type:** Execution

## Purpose

Perform a rigorous re-audit of the current changes.
Identify:

- Side effects introduced by the modification
- Hidden regression risks
- Unhandled edge cases
- Operational, performance, and security implications

The output must provide evidence-based findings and concrete mitigation steps.

---

## When to Use

- After code changes are complete and before merging to a shared branch
- After complex refactoring that touches multiple modules
- Before deploying a hotfix to production
- When a previous review missed edge cases or side effects

---

## When NOT to Use

- During initial implementation (code is still being written)
- Documentation-only or comment-only changes
- Auto-generated code changes (e.g., lock files, migration snapshots)
- Changes already fully audited through another review skill

---

## Inputs Required

Do not run this skill without:

- [ ] Full diff of current working changes
- [ ] List of modified files
- [ ] Affected entry points (API handlers, jobs, CLI, consumers, etc.)
- [ ] Existing related tests (unit/integration/e2e)

Optional but recommended:

- [ ] Architectural context (system diagram, dependency map)
- [ ] Deployment target information (staging, production, canary)

Without asking the user (unless unavailable), gather these inputs directly from the repository.

---

## Output Format

1. Change Units
2. Identified Risks (with evidence)
3. Edge Case Gaps
4. Required Actions (P0 / P1 / P2)
5. Suggested Fix Snippets (if applicable)

---

## Procedure

### Gate 0 – Change Mapping

Break the diff into logical Change Units.

For each Change Unit, summarize:

- Before behavior
- After behavior
- Intended purpose

---

### Gate 1 – Side Effect Analysis

> **EFFICIENCY RULE:** Before deep-analyzing each dimension, perform a
> quick relevance check based on the Change Units from Gate 0. If a
> dimension has zero intersection with the change scope (e.g., no
> database writes exist in any Change Unit → State mutations is
> not relevant), note "N/A — no relevant changes" and move to the next
> dimension. Do NOT skip the relevance check itself.
> "Zero intersection" means the Change Units contain no code that could
> possibly affect that dimension. If uncertain or indirect, treat as relevant.

For each Change Unit, explicitly evaluate:

- Public contract changes
  - Input schema
  - Output structure
  - Error types
  - HTTP status codes
  - Ordering or pagination behavior

- State mutations
  - Database writes
  - Transaction boundaries
  - Cache keys
  - Idempotency guarantees
  - Retry logic

- Concurrency & ordering
  - Async behavior
  - Race conditions
  - Locking
  - Event ordering

- Resource usage
  - N+1 queries
  - Increased memory footprint
  - Large payload buffering
  - CPU-heavy loops

- Security implications
  - Authorization checks
  - Input validation
  - Injection vectors
  - Secret or PII leakage in logs

- Observability impact
  - Log structure changes
  - Metric cardinality explosion
  - Missing tracing

- Operational risk
  - Rollback safety
  - Migration requirements
  - Feature flag need

Each risk must include:

- Evidence (file:line reference)
- Impact assessment
- Mitigation proposal

---

### Gate 2 – Edge Case Matrix

> **SCOPING RULE:** Apply edge case verification only to code paths
> that were **modified or newly introduced** in the current diff.
> Pre-existing edge case gaps in unchanged code are out of scope
> for this audit.

Explicitly verify handling of:

- Null / empty values
- Boundary values (min/max/overflow)
- Large inputs
- Partial failures (timeouts, downstream 5xx)
- Duplicate or out-of-order events
- Permission boundary violations
- Backward compatibility

For each:

- Expected behavior
- Actual behavior
- Gap analysis
- Fix proposal

---

### Gate 3 – Regression Proof

Identify:

- Covered scenarios (existing tests)
- Uncovered risk areas

Propose minimal additional tests (1–3 max) for high-risk gaps.

If adding tests is not feasible:

- Add guard clauses
- Add assertions
- Improve logging
- Provide safe fallback

---

### Gate 4 – Code Hygiene Check

Verify:

- No dead code
- No unnecessary abstraction
- No silent behavioral drift
- No inconsistent error handling
- No policy values hardcoded without documentation

---

## Guardrails

- Do not invent missing facts. Every risk must cite evidence (file:line).
- Explicitly state assumptions when context is incomplete.
- If context is insufficient to assess a risk area, ask for clarification.
- Respect constraints and non-goals stated in the change description.
- Do not inflate severity — use P0/P1/P2 classification honestly.
- Do not skip risk dimensions because they seem unlikely.

---

## Failure Patterns

Common bad outputs:

- Reviewing only the diff without considering the broader call chain
- Classifying all findings as P0 (no prioritization)
- Asserting risks without file:line evidence
- Skipping edge case matrix entirely
- Producing generic advice instead of change-specific findings
- Missing concurrency or state mutation risks in async code paths

---

## Example 1 (Minimal Context)

**Input:**

Single function change: `getUserById` in `services/user.ts` now returns `null` instead of throwing `NotFoundError` when user is not found.

**Output:**

1. Change Units: 1 unit — `getUserById` return type change
2. Identified Risks:
   - P0: All callers expecting `NotFoundError` will now receive `null` without handling it (`routes/user.ts:45`, `middleware/auth.ts:23`)
   - P1: API response may change from 404 to 200 with null body if caller does not check
3. Edge Case Gaps: caller with `try/catch` only — null passes through silently
4. Required Actions: P0 — update all 3 callers to handle null return; P1 — add null-check test for each caller
5. Suggested Fix: add `if (!user) throw new NotFoundError()` guard in each route handler

---

## Example 2 (Realistic Scenario)

**Input:**

8 files changed: new caching layer added to `services/product.ts`, cache invalidation on `PUT /products/:id`, new Redis dependency in `config/cache.ts`. Existing tests cover CRUD but not cache behavior.

**Output:**

1. Change Units: 3 units — (a) cache read in getProduct, (b) cache invalidation on update, (c) Redis config setup
2. Identified Risks:
   - P0: Cache key uses `product:${id}` but bulk endpoints use different ID format — stale cache risk (`services/product.ts:78`)
   - P1: No TTL set — cache entries persist indefinitely (`config/cache.ts:12`)
   - P1: Redis connection failure has no fallback — entire product API will 500 (`services/product.ts:34`)
   - P2: Cache invalidation only on PUT, not on DELETE (`routes/product.ts:92`)
3. Edge Case Gaps: concurrent PUT requests may cause cache race condition; no handling for Redis timeout
4. Required Actions: P0 — normalize cache key format; P1 — add TTL and Redis fallback; P1 — add DELETE invalidation; P2 — add cache-miss metric
5. Suggested Fix: wrap Redis calls in try/catch with DB fallback, add `EX 3600` to SET commands

---

## Notes

**FAST MODE** (only if explicitly requested):

- Limit to top 5 likely risks
- Require at least one regression safeguard
