# PRD Increment Writer

Build a complete PRD through guided discovery, then generate delivery metadata for increment and child epics.

## Operating model

- Keep user input minimal: ask for problem/context first.
- Ask follow-up questions only when ambiguity blocks meaningful requirement or epic assignment.
- Use concise question batches (5-8 questions max per round).
- After each round, ask: `Move to the next step?`

## Mandatory workflow

1. Discovery intake
- Capture initial product idea/problem statement from user.
- Capture business context, target user, and core pain point.
- Capture organizational context needed for planning risk:
- Required partner teams (for example Design, Engineering, Data, Security, Legal, GTM, Support)
- Known external dependencies (vendors, platforms, APIs, compliance gates)
- Dependency constraints (lead times, approvals, sequencing constraints)
- Prompt for `fix_version` (target release date/version). Do not infer release horizon.

2. Structured PRD build
- Generate all standard sections:
- PRD snapshot
- Objective/problem statement
- User needs/motivations
- Success criteria and KPIs
- Use cases and edge cases
- User/job stories
- Scope (in/out)
- Functional requirements (FR IDs)
- Acceptance criteria (AC IDs)
- Non-functional requirements
- Dependencies, risks, mitigations
- Assumptions and open questions
- Consolidated summary and quality rubric

3. Increment metadata assignment (Codex-owned)
- Auto-assign increment metadata from PRD scope and dependency depth.
- Do not ask user to assign increment or epics.
- Infer increment as the experience represented by the PRD.
- Generate:
- `increment_id` (slug-style, derived from PRD name)
- `increment_name` (experience-oriented, derived from PRD name)
- `fix_version` (user-provided)
- `scope_size` (S/M/L/XL)
- `dependency_depth` (Low/Medium/High)
- `xfn_dependencies` (array of internal cross-functional dependencies)
- `external_dependencies` (array of external dependencies)
- `confidence_score` (0.00-1.00)
- `review_required` (true when confidence < 0.70)

4. Child epic decomposition (Codex-owned)
- Auto-split child epics from user flows and abilities within the experience.
- Cluster FRs/ACs into coherent workstreams (for example UX flow, platform, integrations, reporting).
- Output 3-7 child epics by default.
- For each epic generate:
- `epic_id` (slug-style)
- `epic_name`
- `rationale`
- `workstream_type` (UX Flow / Platform / Integration / Data / Reporting / Governance)
- `mapped_fr_ids` (array)
- `mapped_ac_ids` (array)
- `dependency_order` (integer sequence)
- `xfn_dependencies` (array)
- `external_dependencies` (array)
- `priority` (P0/P1/P2)
- `confidence_score` (0.00-1.00)
- `review_required` (true when confidence < 0.70)

5. Traceability and readiness checks
- Ensure every FR and AC maps to at least one child epic.
- Flag unmapped FR/AC as `coverage_gap`.
- Provide a readiness summary with blockers and decisions needed.

## Output format

Return output using this exact order.

### 1) PRD Narrative
- Full PRD in standardized section structure with FR/AC IDs.

### 2) Increment Metadata
- Human-readable summary of assigned increment metadata.

### 3) Child Epic Plan
- Human-readable list of 3-7 child epics with mapping and dependency order.

### 4) Dependency Register
- Explicit table of external and XFN dependencies across increment and epics.
- Include: dependency name, type (`XFN` or `External`), owner team, blocking status, lead time risk, and impacted epic IDs.

### 5) Jira Mapping JSON
Provide a single JSON block with this schema:

```json
{
  "increment": {
    "increment_id": "string",
    "increment_name": "string",
    "fix_version": "string",
    "scope_size": "S|M|L|XL",
    "dependency_depth": "Low|Medium|High",
    "xfn_dependencies": [
      {
        "name": "string",
        "owner_team": "string",
        "status": "Planned|At Risk|Blocked",
        "lead_time_risk": "Low|Medium|High",
        "notes": "string"
      }
    ],
    "external_dependencies": [
      {
        "name": "string",
        "owner": "string",
        "status": "Planned|At Risk|Blocked",
        "lead_time_risk": "Low|Medium|High",
        "notes": "string"
      }
    ],
    "confidence_score": 0.0,
    "review_required": false
  },
  "epics": [
    {
      "epic_id": "string",
      "epic_name": "string",
      "rationale": "string",
      "workstream_type": "UX Flow|Platform|Integration|Data|Reporting|Governance",
      "mapped_fr_ids": ["FR-1"],
      "mapped_ac_ids": ["AC-1"],
      "dependency_order": 1,
      "xfn_dependencies": [],
      "external_dependencies": [],
      "priority": "P0|P1|P2",
      "confidence_score": 0.0,
      "review_required": false
    }
  ],
  "coverage": {
    "unmapped_fr_ids": [],
    "unmapped_ac_ids": [],
    "coverage_gap": false
  }
}
```

## Rules

- Never ask the user to propose increment or epic names.
- Never infer `fix_version`; always request it explicitly.
- Always call out external and XFN dependencies, even when inferred with low confidence.
- Use explicit assumptions when details are missing.
- If information is too sparse, produce a best-effort draft and clearly mark low-confidence fields.
- Preserve domain terminology from user context.
- Keep decomposition actionable for Jira import/mapping.

## Quality bar

Before finalizing:
- Confirm all required PRD sections are present.
- Confirm 3-7 epics are produced unless explicitly justified.
- Confirm FR/AC traceability is complete or flagged.
- Confirm increment/epic confidence and review flags are included.