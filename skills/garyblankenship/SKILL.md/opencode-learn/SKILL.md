---
name: opencode-learn
description: Extracts actionable knowledge from external sources and enhances existing skills using a 4-tier novelty framework. Use PROACTIVELY when a user says "/learn <source>", provides documentation URLs, code examples, or explicitly asks to extract patterns from a repository or marketplace.
---

# INSTRUCTIONS FOR AI ASSISTANT: The /learn Command

## System Prompt

You are executing a rigid knowledge extraction protocol. Your primary objective is to extract **only novel** technical patterns from external sources and inject them into the user's local `skills/` or `prompts/` directory.

You are acting as the Command, the Agent, and the Skill all at once. You must orchestrate the fetching, extracting, matching, and applying.

**CRITICAL DIRECTIVE:** You have a natural tendency to summarize everything you read. **DO NOT DO THIS.** The user's context window is precious. You must aggressively filter out "Tier 1" knowledge (things you already know from your pre-training data) and only retain Tier 2, 3, or 4 insights.

**Core Execution Loop**: 1. Source → 2. Extract → 3. Match → 4. Preview → 5. Approve → 6. Apply → 7. Loop

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| **Summarizing Training Data** | Bloats the context window with useless Tier 1 facts (e.g. "React uses a Virtual DOM"). | Ruthlessly apply the Novelty Test. Exclude Tier 1. |
| **Sequential File Reading** | Calling `read` 100 times in a loop will cause you to time out. | Use **Parallel Tool Calls** inside a single block. |
| **Asking before Editing** | If the user already said "Apply" in Phase 5, pausing to ask permission to edit is maddening. | Execute the edit immediately upon user approval. |
| **Missing Source Links** | Future agents won't know where the pattern came from. | Always append `<!-- Source: {url/file} -->`. |

---

## Phase 1: Source Processing (Execution Steps)

### 1a. URL Sources
**ACTION:** Fetch the URL using a web scraping or fetching tool.
*   **OPTIMIZATION:** Check for `llms.txt` first. Attempt `{base_url}/llms-full.txt` → `llms.txt` → `llms-small.txt`. If found, use it directly to avoid scraping HTML.

### 1b. File Sources & Batch Processing
**ACTION:** If the source is a local directory or repository, use your file search (`glob`/`grep`) and `read` tools.
*   **Strategy:** When analyzing multiple files (e.g., discovering existing skills), you MUST use **Parallel Tool Calls**. Output all your `read` tool calls in a single response.

### 1c. Discovery
**ACTION:** Use your search tools to find existing `SKILL.md` files or `AGENTS.md` manifests.
*   Look for `AGENTS.md` at the project root.
*   Look for `skills/*/SKILL.md` or `prompts/*.md`.
*   Read all discovered files in parallel.

---

## Phase 2: Knowledge Extraction

**MANDATORY:** You must apply the novelty-detection framework to filter the extracted content.

### Tier Classification
You must classify every extracted insight into one of four tiers:
| Tier | Include? | Signal |
|------|----------|--------|
| 1 | **EXCLUDE** | Could write without source (training data) |
| 2 | Include | Shows HOW (implementation-specific) |
| 3 | High value | Explains WHY (architectural trade-offs) |
| 4 | Highest | Contradicts assumptions (counter-intuitive) |

### The Novelty Test
For every insight, ask yourself: *"Could I have written this WITHOUT reading the source?"*
*   **If YES** → It is Tier 1. You MUST EXCLUDE IT.
*   **If NO** → Continue to Tier 2-4 classification.

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

---

## Phase 3: Skill Matching

### Matching Algorithm
You must score each extracted insight against the user's existing skills/prompts to find the best home for it.
1. **Exact domain match**: Insight domain === skill name (score: 100)
2. **Keyword overlap**: Insight keywords ∩ skill description (score: 60-90)
3. **Technology alignment**: Same framework/library family (score: 40-60)
4. **No match**: Score <40 → Skip enhancement and propose a new skill instead.

---

## Phase 4: Enhancement Proposal

### For Each Match (score >= 40)
**1. Read current skill:** Read the contents of the matched skill/prompt file.
**2. Identify target section:** Find the best section (e.g., `Patterns`, `Anti-Patterns`, `Quick Reference`).
**3. Draft the enhancement:**
- Preserve the existing structure exactly.
- Add the insight in the appropriate format for that section.
- You MUST include source attribution: `<!-- Source: {url/file} -->`

---

## Phase 5: User Approval

### The Proposal Format
For each valid enhancement, you must present the proposal to the user exactly like this:

Present the:
1. Target Skill name
2. Insight summary and Tier
3. Diff preview of what you are going to add
4. Source attribution

**ACTION:** Ask the user: `"Apply this enhancement?"` with the options: `Apply`, `Skip`, or `Edit`.

### Response Handling
- **Apply**: Proceed to Phase 6.
- **Skip**: Skip to the next candidate.
- **Edit**: User modifies the text, then you proceed to Phase 6.

---

## Phase 6: Apply & New Skill Proposal

### 6a. Apply Enhancement
**ACTION:** If the user selected 'Apply', you MUST immediately use your file editing tool to insert the drafted block into the target file. **Do not just say you will do it, execute the tool.**

### 6b. When No Match Found (New Skills)
For insights with no match (score <40), present the user with a summary of the domain and keywords.
Ask: `"Propose new skill for {domain}?" [y/n]`
If approved, generate the new skill directory and file.

---

## Quality Gates

### Absolute Rules
- [ ] Zero Tier 1 insights in skills
- [ ] User approves each change (no auto-apply)
- [ ] Diff preview shown before any edit
- [ ] Source attribution in comments

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
