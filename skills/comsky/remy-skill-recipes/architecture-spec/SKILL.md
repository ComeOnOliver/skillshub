---
name: architecture-spec
description: >
  Generate architecture and design documents for implemented code changes
  with risk-based depth selection. Automatically evaluates risk signals,
  layer spread, and change magnitude to choose documentation level (A/B/C).
license: MIT
compatibility:
  - Claude Code
  - Cursor
metadata:
  type: execution
  category: documentation
  maturity: draft
  estimated_time: 10 min
---

# Skill: Architecture Spec (Post-Implementation)

**Type:** Execution

## Purpose

Given implemented changes (diff / changed files), generate an
architecture/design document with appropriate depth.

The depth is selected automatically based on:

- Risk signals
- Layer spread
- Change magnitude
- Sensitive areas (auth, infra, migration, etc.)

---

## When to Use

- After completing a feature or significant code change
- Before merging a PR that touches multiple layers or sensitive areas
- When stakeholders need a design record for changes already implemented
- After a hotfix or incident-driven change that requires documentation

---

## When NOT to Use

- During initial design/planning (use a design doc skill instead)
- Documentation-only or comment-only changes
- Auto-generated code changes (lock files, migration snapshots)
- Trivial single-file changes with no risk signals (e.g., typo fix)

---

## Inputs Required

Do not run this skill without:

- [ ] changed_files (list of modified files)
- [ ] diff_summary (LOC count or file count)
- [ ] feature_name (short name for the change)

Optional but recommended:

- [ ] diff_snippets (key portions of the diff)
- [ ] repo_context (architecture overview, dependency map)

Without asking the user (unless unavailable), gather these inputs directly from the repository.

---

## Output Format

1. Risk Evaluation Summary (score breakdown, selected level)
2. Architecture/Design Document (level-appropriate Markdown)
3. ADR section (Level C only)
4. Notion page URL (if Notion integration available)

---

## Procedure

### Step 1 — Evaluate Risk

→ Detailed scoring criteria: [subskills/diff-risk-evaluator.md](subskills/diff-risk-evaluator.md)
  (load only if the summary below is insufficient for scoring)

Analyze changed files and calculate a deterministic risk score across three dimensions:

| Dimension | What it measures |
|---|---|
| Path-Based Risk | Sensitive area keywords in file paths (+3 to +4 per match) |
| Layer Spread | Number of architectural layers touched (+1 to +5) |
| Change Magnitude | Lines of code changed (+1 to +6) |

`total_score = path_score + layer_score + magnitude_score`

### Step 2 — Select Documentation Level

| Total Score | Level |
|---|---|
| 0–6 | A (Lightweight) |
| 7–13 | B (Standard) |
| 14+ | C (Architecture-Level) |

**Hard Rules:**

- Auth + multi-layer → minimum B
- Infra change → minimum B
- Migration + medium change → minimum B
- Financial impact → C
- Global middleware + high magnitude → C

If unsure, prefer B over A.

### Step 3 — Generate Document

→ Load and follow [subskills/notion-spec-generator.md](subskills/notion-spec-generator.md)
  at this point (not before).

Generate a Notion-ready Markdown document for the selected level:

- **Level A** — Overview, What Changed, Simple Flow, Decisions, Test Notes
- **Level B** — Level A + Architecture, Sequence Diagram, API Spec, Edge Cases, Security Notes, Operational Notes, Future Improvements
- **Level C** — Level B + Threat Model, Failure Flow, Rollback Plan, Observability Plan, ADR-style Decisions

For Level C only, additionally load and follow
[subskills/adr-generator.md](subskills/adr-generator.md) to produce
a formal ADR section. Do NOT load this subskill for Level A or B.

All levels must include: Title, Metadata table, TL;DR, Changed files summary.

### Step 4 — Publish to Notion (Optional)

> **ACTIVATION:** This step runs only if Notion MCP integration is
> available and the user requests publishing. If skipped, do NOT load
> the subskill file.

→ Load and follow [subskills/notion-page-publisher.md](subskills/notion-page-publisher.md)
  only when this step is activated.

If Notion MCP integration is available, persist the generated spec to Notion:

- Create or update a page in the target database
- Map properties (Level, Risk Score, Feature, Status)
- For Level C, attach ADR as a child page or appended section
- If a Draft page with the same feature name exists, update instead of creating a new one
- Return the Notion page URL

---

## Quality Bar

The document must answer:

- What changed?
- Why?
- How does it work?
- Where can it fail?
- How is it monitored?
- How do we roll back?
- Is the document visually scannable? (emoji headings, tables, diagrams, dividers)

---

## Guardrails

- Deterministic scoring first; keyword detection only nudges the level.
- Never under-document security or financial changes.
- Prefer a safer (higher) level if signals are incomplete.
- Do not invent architecture details not present in the code.
- Explicitly state assumptions when context is incomplete.
- If inputs are insufficient to evaluate risk, ask for clarification before proceeding.
- Do not skip the risk evaluation step and jump directly to document generation.

---

## Failure Patterns

Common bad outputs:

- Selecting Level A for multi-layer changes that touch auth or infra
- Generating a document without running the risk scoring procedure
- Producing generic architecture descriptions not tied to the actual diff
- Missing the ADR section for Level C changes
- Inflating risk scores by double-counting the same file in multiple categories
- Skipping the Quality Bar questions (especially "Where can it fail?" and "How do we roll back?")

---

## Example 1 (Minimal Context)

**Input:**

feature_name: "Add rate limiting to public API"
changed_files: `middleware/rate-limiter.ts`, `config/rate-limit.ts`, `routes/api.ts`
diff_summary: 120 LOC

**Output:**

1. Risk Evaluation:
   - Path score: +3 (middleware) + +3 (config) = 6
   - Layer spread: +3 (2 layers: middleware, routes)
   - Magnitude: +1 (<150 LOC)
   - Total: 10 → **Level B**
2. Document: Standard spec with Overview, Architecture (middleware chain diagram), Sequence Diagram (request → rate check → pass/reject), API Spec (429 response), Edge Cases (distributed rate limiting gaps), Security Notes (bypass vectors), Operational Notes (Redis dependency)

---

## Example 2 (Realistic Scenario)

**Input:**

feature_name: "Migrate user auth from session to JWT"
changed_files: `auth/jwt-provider.ts`, `auth/session-provider.ts` (deleted), `middleware/auth.ts`, `config/auth.ts`, `migrations/20250220_drop_sessions.sql`, `routes/login.ts`, `routes/logout.ts`, `services/user.ts`, `tests/auth.test.ts`
diff_summary: 850 LOC

**Output:**

1. Risk Evaluation:
   - Path score: +4 (auth) + +3 (middleware) + +3 (config) + +3 (migration) = 13
   - Layer spread: +5 (4+ layers: auth, middleware, config, routes, services)
   - Magnitude: +4 (500–1500 LOC)
   - Total: 22 → **Level C**
   - Hard rule applied: Auth + multi-layer → minimum B (already exceeded)
2. Document: Full architecture spec with Threat Model (token theft, replay attacks), Failure Flow (JWT validation failure paths), Rollback Plan (session table restoration, dual-auth transition period), Observability Plan (auth failure rate metric, token expiry distribution)
3. ADR: "Migrate from server-side sessions to JWT" — options considered (session + Redis vs JWT vs JWT + refresh token), decision rationale, consequences (stateless scaling benefit vs token revocation complexity)

---

## Notes

**FAST MODE** (only if explicitly requested):

- Always use Level A regardless of risk score
- Skip Step 4 (Notion publish)
- Risk evaluation still runs for the metadata record

---

This skill delegates detailed work to four subskills:

- **diff-risk-evaluator** — risk scoring only (no document generation)
- **notion-spec-generator** — Markdown document generation per level
- **adr-generator** — ADR section for Level C changes
- **notion-page-publisher** — Persist spec to Notion (optional, requires Notion MCP)
