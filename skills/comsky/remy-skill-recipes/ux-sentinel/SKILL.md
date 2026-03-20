---
name: ux-sentinel
description: >
  Continuously detect recurring UI/UX concepts during frontend discussions,
  track conversation-wide recurrence, and register repeated concepts as
  structured knowledge assets in a Notion database via MCP.
license: MIT
compatibility:
  - Claude Code
  - Cursor
metadata:
  type: system
  category: automation
  maturity: draft
  activation: hybrid
  state: external DB-backed
  dependencies: Notion MCP
---

# Skill: UX Sentinel

**Type:** System

## Purpose

Continuously detect UI/UX concepts during frontend discussions,
track global recurrence (conversation-wide),
and convert repeated concepts into structured knowledge assets
in a connected Notion database via MCP.

Recurrence threshold: 2  
Manual override supported via @ux commands.  
Notion lookup is always performed.

---

## Scope

This skill activates when:

- UI/UX terms, principles, heuristics, laws, patterns, or design concepts appear.
- The user triggers a manual command such as `@ux save`.

This skill operates across the entire conversation history (global recurrence),
not per-project or per-feature.

---

## Inputs / Signals

- Conversation content (all messages in the current session)
- Manual `@ux` commands from the user
- Notion database state (`UI/UX Knowledge Base` via MCP query)
- Local recurrence counters (conversation-wide, in-memory)

---

## Core Behavior

> **DETECTION FREQUENCY:** Concept detection runs on every user message
> that contains **3 or more words related to UI, UX, design, layout,
> interaction, or visual presentation**. Messages that are purely about
> code logic, configuration, or non-frontend topics do not trigger
> detection. This prevents unnecessary Notion queries during backend
> or infrastructure discussions.

### 0. Database Bootstrap (runs once per conversation)

> **MCP COMPATIBILITY:** The tool names below (e.g., `API-post-search`,
> `API-post-page`) follow the `@notionhq/notion-mcp-server` convention.
> If your MCP server uses different tool names, map them to the
> equivalent Notion REST API endpoints (`POST /v1/search`, `POST /v1/pages`, etc.).

Before any concept detection, verify the Notion database exists:

1. Search Notion for a database titled `UI/UX Knowledge Base`
   using `API-post-search` with `filter: { value: "data_source", property: "object" }`.
2. If found → cache the `database_id` for the conversation and proceed.
3. If NOT found → ask the user:

   "UI/UX Knowledge Base database not found in Notion. Create it? (Yes / No)"

   - If **Yes** → follow the **Database Creation** steps below.
   - If **No** → fall back to local-only tracking for the rest of the conversation.
     All concept detection still runs, proposals are still shown,
     but no Notion reads/writes occur. Log: "Notion DB unavailable — local tracking only."

Cache the resolved `database_id` (or `null` if declined) for the conversation.
Do NOT re-prompt on every concept detection.

#### Database Creation

**Known constraints** (as of Notion API 2025-09-03 / Notion Internal Integration type):

- Workspace-level page creation is blocked for Notion Internal Integrations (as opposed to Public OAuth Integrations).
- The MCP `API-create-a-data-source` endpoint does not support
  new database creation under API version 2025-09-03.

**Procedure:**

1. **Select a parent page**: Search for a suitable existing page
   (e.g. the project's root page) using `API-post-search`.
   Present candidate pages to the user and let them choose.

2. **Create a dedicated container page** under the chosen parent
   via MCP `API-post-page` (e.g. title "UX Sentinel", icon shield emoji).
   **Do NOT create the inline database directly inside the parent page** —
   the parent is typically an index page whose document structure would break.

3. **Create the database via direct REST API** (Shell tool),
   using the **container page ID** from step 2 as the parent:

   ```bash
   curl -s -X POST 'https://api.notion.com/v1/databases' \
     -H 'Authorization: Bearer $NOTION_TOKEN' \
     -H 'Content-Type: application/json' \
     -H 'Notion-Version: 2022-06-28' \
     -d '{ "parent": { "type": "page_id", "page_id": "<CONTAINER_PAGE_ID>" },
            "title": [{"type":"text","text":{"content":"UI/UX Knowledge Base"}}],
            "is_inline": true,
            "properties": { <SCHEMA — see Notion Database Requirements> } }'
   ```

   The `NOTION_TOKEN` can be retrieved from your MCP client's configuration.
   Common locations:
   - Cursor: `~/.cursor/mcp.json` → `mcpServers.<your-notion-server>.env.NOTION_TOKEN`
   - Claude Desktop: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Other clients: check your MCP client's documentation

4. **Cache the returned `database_id`** for the conversation.
   After creation, all subsequent reads/writes use MCP tools
   (`API-query-data-source`, `API-post-page`, `API-patch-page`)
   which work normally with the 2025-09-03 API version.

---

### 1. Concept Detection

> **QUERY EFFICIENCY:** When querying Notion DB for an existing
> concept, request only the `Title` and `Recurrence Count` properties
> (not the full page content). Full page content is only needed when
> updating `Trigger Context` or appending notes in Section 2.

When a UI/UX concept appears:

1. Normalize concept name → `concept_key`
   - lowercase
   - remove apostrophes/special characters
   - trim spaces
   - apply alias mapping (e.g., "Hick's Law" = "Hicks Law")

2. Query Notion DB (skip if database bootstrap resolved to local-only):
   - Database: `UI/UX Knowledge Base`
   - Match by title or stored concept_key

---

### 2. If Concept Exists in Notion

- Increment `Recurrence Count`
- Update `Last Seen` (today)
- Merge new `Trigger Context` tags if applicable
- Optionally append short "New evidence/context" note

No proposal required.

---

### 3. If Concept Does Not Exist

- Track local recurrence counter (conversation-wide)

If local recurrence >= 2:
→ Propose registration.

Proposal must include:

- Concept name
- Suggested category
- One-line definition
- 2–3 actionable UI decision rules

Then ask:

"Register to Notion? (Yes / No)"

If Yes → Create entry.
If No → Do nothing (keep counter).

---

## Manual Commands

The following commands override recurrence logic:

### Save most recent detected concept

`@ux save`

### Save specific concept immediately

`@ux save: <concept>`

### Skip current detection/proposal

`@ux skip`

### Create relation between concepts

`@ux link: <A> -> <B>`

Manual save:

- Ignores recurrence threshold
- Sets `Maturity = Observed`
- Initializes `Recurrence Count` with local count if available (minimum 1)

---

## Notion Database Requirements

Database name:
UI/UX Knowledge Base

Required properties:

| Property | Type | Options / Notes |
|---|---|---|
| Concept | Title | Primary key |
| Category | Select | Cognitive / Visual / Interaction / IA |
| Recurrence Count | Number | Incremented on each sighting |
| First Seen | Date | Set on creation only |
| Last Seen | Date | Updated on every sighting |
| Trigger Context | Multi-select | e.g. "pipeline-flicker", "route-transition" |
| UI Decision Rule | Rich text | 2-3 actionable rules |
| Product Context | Rich text | Where/why this concept matters |
| Maturity | Select | Observed / Applied / Internalized |
| Related Concepts | Relation (self) | Links between related entries |

### Manual Setup (fallback)

If direct REST API access is unavailable (e.g. no shell access,
token not found in your MCP client configuration):

1. Create a page under the chosen parent via MCP `API-post-page`.
2. Print the property schema table above and instruct the user to
   convert the page to an inline database in the Notion UI manually.
3. Once converted, have the user provide the database ID to cache.

---

## Category Auto-Inference Rules

- cognitive / overload / choice → Cognitive
- hierarchy / contrast / alignment → Visual
- click / motor / target / feedback → Interaction
- structure / grouping / navigation → IA

User may override at proposal stage.

---

## Notion Page Template (Concise Asset)

When creating a new entry:

### 1. One-Line Definition

### 2. Why It Recurred in This Product

### 3. UI Decision Rule

-
-
-

### 4. Implementation Pattern

- Component:
- Layout:
- Code Hint:

### 5. Anti-Pattern

-

### 6. Related Concepts

---

## Output / Side Effects

Messages shown to the user:

- Concept detection notification (when recurrence threshold met)
- Registration proposal with concept summary
- Confirmation after Notion write

External writes (Notion DB):

- New page creation in `UI/UX Knowledge Base` (concept registration)
- Page property updates (`Recurrence Count`, `Last Seen`, `Trigger Context`)
- Relation updates (`Related Concepts`)

Local state:

- In-memory recurrence counters per concept (conversation-wide)
- Cached `database_id` (conversation-wide)

---

## Guardrails

- Do not create entries for vague generic words unless clearly tied to a recognized principle.
- Normalize concept keys to prevent duplicates.
- Re-query Notion before creation to avoid race-condition duplicates.
- Keep entries concise and implementation-oriented.
- If Notion DB is unavailable (user declined or MCP error), continue all detection
  and proposal logic in local-only mode. Never silently skip concept tracking.
- Database bootstrap prompt must appear at most once per conversation.

---

## Failure Patterns

- Duplicate entries created due to alias mismatch (e.g., "Hick's Law" vs "Hicks Law" not normalized)
- Over-triggering on generic terms that happen to overlap with UX vocabulary (e.g., "contrast" in a non-design context)
- Missing updates because of overly strict title matching against Notion
- Silent concept loss when Notion MCP errors are swallowed without falling back to local tracking
- Proposing registration for concepts that already exist in Notion due to stale local cache
- Category mis-inference when keyword heuristics conflict (e.g., "navigation contrast")

---

## Example 1 (Automatic Trigger)

**Input (conversation snippet):**

User mentions "cognitive load" while discussing a complex form layout. Later in the same conversation, user references "cognitive load" again when reviewing a dashboard with too many metrics.

**Expected behavior:**

1. First mention: concept detected, `concept_key = "cognitive load"`, Notion queried — not found, local counter set to 1. No proposal.
2. Second mention: local counter incremented to 2 (threshold met). Proposal shown:
   - Concept: Cognitive Load
   - Category: Cognitive
   - Definition: "The total mental effort required to process information in a UI."
   - Decision rules: (1) Limit visible form fields to 5–7 per step, (2) Group related metrics under collapsible sections, (3) Use progressive disclosure for secondary actions.
3. User confirms → entry created in Notion with `Recurrence Count = 2`, `First Seen = today`, `Maturity = Observed`.

---

## Example 2 (Manual Command)

**Input command:**

User types `@ux save: Fitts's Law` after a single mention during a button sizing discussion.

**Expected behavior:**

1. Normalize: `concept_key = "fittss law"` → alias resolved to `"fitts law"`.
2. Query Notion — not found.
3. Skip recurrence threshold (manual save).
4. Create entry immediately:
   - Concept: Fitts's Law
   - Category: Interaction (inferred from "motor/target" keywords)
   - Recurrence Count: 1
   - Maturity: Observed
   - UI Decision Rule: (1) Increase tap target size for primary actions to minimum 44px, (2) Place frequently used buttons closer to natural cursor/thumb resting position.
5. Confirm to user: "Fitts's Law registered to UI/UX Knowledge Base."

---

## Notes

**FAST MODE** (only if explicitly requested):

- Increase recurrence threshold to 3
- Skip Notion query — use local-only tracking for the entire session
- Manual `@ux save` commands still work in local-only mode

---

## Design Philosophy

This skill does not create a glossary.

It builds a decision-making memory system
based on repeated UI friction signals.

Focus on:

- Why it recurred
- What rule it creates
- How it affects implementation
