---
name: skill-learning
description: Extracts actionable knowledge from external sources and enhances existing skills using a 4-tier novelty framework. Use when learning from URLs, documentation, or codebases. Proactively use when the user asks to extract patterns from a reference repository or skill marketplace.
---

# INSTRUCTIONS FOR CLAUDE: Skill Learning Methodology

## Quick Reference

| Intent | Action |
|--------|--------|
| Extract patterns from a URL | Use `WebFetch` and Phase 1a |
| Extract patterns from a codebase | Use `Glob`/`Read` and Phase 1b |
| Match an extracted insight to a skill | Execute Phase 3 Scoring Algorithm |
| Propose an enhancement to the user | Follow the format in Phase 5 |
| Apply an approved enhancement | Immediately `Edit` the target `SKILL.md` |

## When to Use

- User provides a URL to documentation or an article and asks to learn from it.
- User points to a local directory or repository to extract design patterns.
- User provides a path to another agent's skill directory or a marketplace.
- Proactively when a user pastes a large block of reference code and asks to "save this pattern."

## System Prompt

You are executing a rigid 7-phase knowledge extraction protocol. Your primary objective is to extract **only novel** technical patterns from external sources and inject them into the user's local `skills/` directory. 

**CRITICAL DIRECTIVE:** You have a natural tendency to summarize everything you read. **DO NOT DO THIS.** The user's context window is precious. You must aggressively filter out "Tier 1" knowledge (things you already know from your pre-training data) and only retain Tier 2, 3, or 4 insights.

**Core Execution Loop**: 1. Source → 2. Extract → 3. Match → 4. Preview → 5. Approve → 6. Apply → 7. Loop

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| **Summarizing Training Data** | Bloats the context window with useless Tier 1 facts (e.g. "React uses a Virtual DOM"). | Ruthlessly apply the Novelty Test. Exclude Tier 1. |
| **Sequential File Reading** | Calling `Read()` 100 times in a loop will cause the model to time out. | Use **Parallel Tool Calls** inside a single block. |
| **Asking before Editing** | If the user already said "Apply" in Phase 5, pausing to ask permission to use the `Edit` tool is maddening. | Execute the `Edit` tool immediately upon user approval. |
| **Missing Source Links** | Future agents won't know where the pattern came from. | Always append `<!-- Source: {url/file} -->`. |

---

## Phase 1: Source Processing (Execution Steps)

### 1a. URL Sources
**ACTION:** You must attempt to fetch the URL using the `WebFetch` tool.
*   **OPTIMIZATION:** Check for `llms.txt` first. Attempt `{base_url}/llms-full.txt` → `llms.txt` → `llms-small.txt`. If found, use it directly to avoid scraping HTML.
*   **Primary:** `WebFetch(url, format="markdown")`
*   **Fallback:** If blocked by bot-protection, use `WebFetch("https://r.jina.ai/{url}")`.

### 1b. File Sources & Batch Processing
**ACTION:** If the source is a local directory or repository, use `Glob` and `Read`.
*   **Strategy:** When analyzing multiple files (e.g., discovering existing skills), you MUST use **Parallel Tool Calls**. Output all your `Read` tool calls in a single response block. 
*   **Anti-pattern:** Never use sequential `Read` calls for a large list of files. You will time out.

### 1c. Local Directory Discovery (Plugin/Marketplace Structures)
**ACTION:** Use `Glob` and `Read` tools to find existing `SKILL.md` files or `AGENTS.md` manifests.

*   **Structure A: AGENTS.md manifest (preferred)**
    Read `{dir}/AGENTS.md`. Parse `<available_skills>` section and extract relative paths.
*   **Structure B: Plugin directories with nested skills**
    Use `Glob` with pattern `*/skills/*/SKILL.md` or `*/skills/*/*.md`.
*   **Structure C: Flat skill collection**
    Use `Glob` with pattern `skills/*/SKILL.md`.
*   **Structure D: Mixed/unknown structure**
    Use `Glob` with pattern `**/SKILL.md` to find all skills recursively.

Once discovered, execute **Parallel Read** on all discovered skills.

### 1d. Repository Documentation Discovery
When learning from a code repository (not a skills/plugin directory):

1.  **Identify repo type:** Look for `package.json`, `go.mod`, `Cargo.toml`, `pyproject.toml`.
2.  **Find docs:** `README.md`, `CONTRIBUTING.md`, `docs/*.md`.
3.  **Find schemas/types:** `**/*.d.ts`, `**/*_types.go`, `**/*.schema.json`.
4.  **Find examples:** `**/examples/*`, `**/presets/*`.

**Use Repo Learning when:** Extracting schemas/formats, learning from reference implementations, or building NEW skills FROM a repo's patterns.
**Use Skill/URL Learning when:** Enhancing EXISTING skills with insights from documentation/articles or copying skills from marketplaces.

### 1e. Content Cleaning
Before processing, mentally strip navigation, ads, and boilerplate. Preserve code blocks verbatim.

## Phase 2: Knowledge Extraction

**MANDATORY:** You must apply the novelty-detection framework to filter the extracted content.

### Tier Classification
You must classify every extracted insight into one of four tiers:
| Tier | Include? | Signal |
|------|----------|--------|
| 1 | EXCLUDE | Could write without source (training data) |
| 2 | Include | Shows HOW (implementation-specific) |
| 3 | High value | Explains WHY (architectural trade-offs) |
| 4 | Highest | Contradicts assumptions (counter-intuitive) |

### The Novelty Test
For every insight, ask yourself: *"Could I have written this WITHOUT reading the source?"*
*   **If YES** → It is Tier 1. You MUST EXCLUDE IT.
*   **If NO** → Continue to Tier 2-4 classification.

### Calibration Examples

**API Documentation Analysis:**
```
Claim: "OpenAI provides an API for generating text"
→ Tier 1 ❌ — Generic, could write from training data

Claim: "Responses API uses max_output_tokens instead of max_tokens"
→ Tier 2 ✅ — Specific parameter name (HOW)

Claim: "Reasoning models put chain-of-thought in reasoning_content array,
        not content — must sum both for billing"
→ Tier 4 ✅✅✅ — Counter-intuitive, prevents billing surprise
```

**Database Performance:**
```
Claim: "Create indexes on foreign key columns for faster joins"
→ Tier 1 ❌ — Generic DBA advice

Claim: "PostgreSQL partial indexes reduce size 60%, improve write perf 40%"
→ Tier 2 ✅ — Specific feature with quantified benefit

Claim: "Covering indexes avoid heap lookups (3x faster reads, 15% slower writes)"
→ Tier 3 ✅✅ — Quantified trade-off, explains WHY

Claim: "JSONB GIN indexes do NOT support ORDER BY on JSON fields"
→ Tier 4 ✅✅✅ — Contradicts expectation, prevents bug
```

**Framework Patterns:**
```
Claim: "React uses a virtual DOM for efficient updates"
→ Tier 1 ❌ — Training data, everyone knows this

Claim: "Next.js App Router requires 'use client' directive for useState"
→ Tier 2 ✅ — Specific requirement (HOW)

Claim: "Server Components reduce JS bundle by 60% but can't use client state"
→ Tier 3 ✅✅ — Trade-off with quantification (WHY)

Claim: "generateStaticParams runs at BUILD time, not request time —
        dynamic data causes 404s"
→ Tier 4 ✅✅✅ — Contradicts mental model, prevents production bug
```

### Insight Structure Requirements
You must structure each extracted insight logically before scoring it:
```json
{
  "tier": 2,
  "domain": "sveltekit",
  "pattern": "Server-only load with +page.server.ts",
  "insight": "Data fetching in +page.server.ts runs only on server, +page.ts runs on both",
  "keywords": ["sveltekit", "load", "server", "ssr"],
  "source_context": "Line 45-52 of routing docs"
}
```

### Quality Filter
- Zero Tier 1 leakage (absolute).
- Minimum 3 Tier 2-4 insights per source (or skip the source).
- Each insight must have a `domain` + `keywords`.

## Phase 3: Skill Matching

### 3a. Discovery
**ACTION:** Find all existing skills using the `Glob` tool with the pattern `skills/*/SKILL.md`. 
If you already discovered them in Phase 1, you can skip this step.

### 3b. Matching Algorithm
You must score each extracted insight against the user's existing skills to find the best home for it.
1. **Exact domain match**: Insight domain === skill name (score: 100)
2. **Keyword overlap**: Insight keywords ∩ skill description (score: 60-90)
3. **Technology alignment**: Same framework/library family (score: 40-60)
4. **No match**: Score <40 → Skip enhancement and propose a new skill instead.

## Phase 4: Enhancement Proposal

### For Each Match (score >= 40)

**1. Read current skill**
**ACTION:** Use the `Read` tool to read the contents of `skills/{skill-name}/SKILL.md`.

**2. Identify target section**
Determine where the insight fits inside the existing skill file:
| Insight Type | Target Section |
|--------------|----------------|
| Quick fact | Quick Reference table |
| Pattern + example | Patterns / Examples |
| Gotcha / warning | Anti-Patterns / Common Mistakes |
| Workflow step | Process / Workflow |
| Validation rule | Checklist |

**3. Draft the enhancement**
- Preserve the existing structure exactly.
- Add the insight in the appropriate format for that section.
- You MUST include source attribution: `<!-- Source: {url/file} -->`

**4. CLEAR Validation**
Mentally apply the CLEAR framework to your proposed addition:
- **C**ompact: Will the word count stay under 5000?
- **L**abeled: Are keywords in the right places?
- **E**xample: Does the example show a clear transformation?
- **A**ctionable: Is the actionable pattern named?
- **R**eferences: Is there no duplication, and does it use references?

## Phase 5: User Approval

### The Proposal Format
For each valid enhancement, you must present the proposal to the user exactly like the examples shown in the **Examples** section at the bottom of this document.

Present the:
1. Target Skill name
2. Insight summary and Tier
3. Diff preview of what you are going to add
4. Source attribution

**ACTION:** Use the `AskUserQuestion` tool to ask: `"Apply this enhancement?"` with the options: `Apply`, `Skip`, or `Edit`.

### Response Handling
- **Apply**: Proceed to Phase 6.
- **Skip**: Skip to the next candidate.
- **Edit**: User modifies the text, then you proceed to Phase 6.

## Phase 6: Apply & New Skill Proposal

### 6a. Apply Enhancement
**ACTION:** If the user selected 'Apply', you MUST immediately use the `Edit` tool on `skills/{skill-name}/SKILL.md` to insert the drafted block into the target section. **Do not just say you will do it, execute the tool.**

### 6b. When No Match Found (New Skills)
For insights with no match (score <40), present the user with a summary of the domain and keywords.
Ask: `"Propose new skill for {domain}?" [y/n]`
If approved, generate the new skill directory and `SKILL.md` file using the `Write` tool.

## Phase 7: Loop Control

### After Each Source
Summary:
- Insights extracted: X (Tier 2: Y, Tier 3: Z, Tier 4: W)
- Skills enhanced: [list]
- New skills created: [list]
- Rejected: [count]

Next source? (file path, URL, or 'done')

## Quality Gates

### Absolute Rules
- [ ] Zero Tier 1 insights in skills
- [ ] User approves each change (no auto-apply)
- [ ] Diff preview shown before any edit
- [ ] Source attribution in comments

### Warning Triggers
- Skill exceeds 5000 words → suggest splitting
- Large source (10K+ pages) → create router skill
- Insight duplicates existing content → skip
- CLEAR validation fails → revise before applying

## Examples

### Example 1: Extracting from Documentation
**Source**: User runs `/learn https://svelte.dev/docs/kit/state-management`
**Insight (Tier 3)**: SvelteKit 5 replaces store subscriptions with runes (`$state`, `$derived`) for reactivity.
**Target Skill**: `sveltekit-patterns`
**Agent Output Preview**:
```markdown
## Enhancement Proposal (Score: 85, Tier: 3)

**Insight**: SvelteKit 5 relies on runes ($state, $derived) instead of store subscriptions for reactive UI state.
**Target Skill**: skills/sveltekit-patterns/SKILL.md
**Section**: Patterns

**Proposed Addition**:
### Runes vs Stores (Svelte 5)
<!-- Source: https://svelte.dev/docs/kit/state-management -->
Replace old `writable` stores with `$state()` runes for component-level reactivity. Do not use `$:` for derived state; use `$derived()` instead.

Apply this enhancement? [y/n/edit]
```

### Example 2: Extracting from Codebase
**Source**: User runs `/learn ~/projects/api-gateway`
**Insight (Tier 2)**: The codebase uses a specific Zod schema wrapper (`validateRequest(schema)`) for all incoming request validation.
**Target Skill**: `api-middleware`
**Agent Output Preview**:
```markdown
## Enhancement Proposal (Score: 70, Tier: 2)

**Insight**: Local convention uses `validateRequest(schema)` middleware pattern for all Zod validation.
**Target Skill**: skills/api-middleware/SKILL.md
**Section**: Anti-Patterns / Common Mistakes

**Proposed Addition**:
### Zod Validation Convention
<!-- Source: ~/projects/api-gateway/src/middleware/ -->
**Do NOT** validate Zod schemas inline inside the route handler. 
**DO** use the `validateRequest(schema)` middleware exported from `src/middleware/validator.ts`.

Apply this enhancement? [y/n/edit]
```

