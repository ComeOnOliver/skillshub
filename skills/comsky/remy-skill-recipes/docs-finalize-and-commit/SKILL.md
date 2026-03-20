---
name: docs-finalize-and-commit
description: >
  Finalize documentation changes for production readiness by discovering
  existing conventions, verifying code-doc alignment, reviewing
  format/terminology/tone consistency, and structuring clean commits.
  Counterpart of finalize-and-commit for documentation projects.
license: MIT
compatibility:
  - Claude Code
  - Cursor
metadata:
  type: execution
  category: documentation
  maturity: stable
  estimated_time: 15 min
---

# Skill: Finalize Documentation and Commit (Review, Consistency, Alignment)

**Type:** Execution

## Purpose

Finalize documentation changes for production readiness in a documentation
project that coexists with the product source code in the same workspace.
Works with any documentation framework (Docusaurus, VitePress, MkDocs, Nextra,
plain Markdown, etc.).

Tasks:

- Discover conventions from existing documentation
- Verify code-documentation alignment when source code changed
- Review format, terminology, tone, and completeness consistency
- Validate framework-specific syntax and build integrity
- Prepare structured commits separated by change type

---

## When to Use

- Before committing documentation changes to a shared branch
- Before submitting a pull request that includes documentation updates
- After completing a documentation session that touched multiple pages
- When source code and documentation were both modified in the same session
- When preparing a clean commit history from messy documentation edits

---

## When NOT to Use

- Work-in-progress drafts still actively being written
- Trivial single-line typo fixes that need no consistency review
- Initial documentation scaffolding or exploratory writing phases
- Changes already reviewed and approved through another skill
- Standalone Markdown files outside a documentation project structure

---

## Inputs Required

Do not run this skill without:

- [ ] Working tree with uncommitted or staged `.md`/`.mdx` file changes
- [ ] Access to the documentation project build command (if the framework
  provides one)
- [ ] Existing documentation files to derive conventions from (at least 3 pages)

Optional but recommended:

- [ ] Target branch context (e.g., main, release)
- [ ] List of intended change scope (files or directories)
- [ ] Known glossary or style guide (if any)

---

## Output Format

1. Convention Reference (discovered patterns)
2. Code-Documentation Alignment Report
3. Quality Review Findings
4. Actions Taken (auto-fixes applied)
5. Build Verification Results
6. Commit Plan
7. Final Commit Messages

---

## Procedure

### Gate 0 – Working Set Validation

> **CRITICAL:** The working tree may contain changes from other agent sessions
> or manual edits. This gate must isolate *only* the current session's changes
> without disturbing anything else.

**Step 0-1: Identify current session scope**

- Review the conversation history and edit history of this session.
- Build an explicit list of `.md`/`.mdx` files that were created, modified,
  or deleted *by this session*.
- Separately identify source code files changed in this session (needed for
  Gate 2).
- If the user provided a scope list, use that as the authoritative source.

**Step 0-2: Inspect full working tree state**

- Run `git status` and `git diff --name-only` to enumerate all uncommitted
  changes in the working tree.

**Step 0-3: Classify changes**

- **Doc-scope:** `.md`/`.mdx` files that appear in both the session scope
  (Step 0-1) and the working tree (Step 0-2).
- **Code-scope:** Source code files changed by this session (input for Gate 2).
- **Out-of-scope:** Files in the working tree NOT modified by this session.

**Step 0-4: Protect out-of-scope changes**

- **NEVER** revert, restore, checkout, stash, or discard out-of-scope changes.
- Out-of-scope files must be left exactly as they are in the working tree.
- The only correct action is to *exclude* them from staging (`git add`).

**Step 0-5: Confirm with the user**

- Present a summary:
  - Documentation files to be reviewed and committed (doc-scope)
  - Source code files to cross-reference (code-scope)
  - Files left untouched (out-of-scope), if any
- Proceed only after the user confirms the target set.

---

### Gate 1 – Convention Discovery

> **PURPOSE:** Since no formal style guide exists, infer conventions from
> existing documentation to use as the review baseline.

**Step 1-1a: Scan documentation headers**

- Read **frontmatter + first 30 lines** of 10–15 representative
  `.md`/`.mdx` files from the docs directory
  (prioritize recently modified, high-traffic pages).
- If fewer than 10 documentation files exist, read all available files.
- Exclude files in the current session's change set to avoid circular
  reference.
- From this scan, extract: frontmatter field names, heading structure,
  first paragraph tone/speech level.

**Step 1-1b: Deep read divergent samples**

- Compare patterns extracted in Step 1-1a across all samples.
- Identify files where patterns diverge or are ambiguous
  (e.g., inconsistent frontmatter fields, mixed heading levels).
- Full-read only the divergent files (typically 2–5 files) to resolve
  ambiguity.
- If all samples show consistent patterns in Step 1-1a, skip this step.

**Step 1-2: Extract structural patterns**

- Frontmatter fields and their value patterns (title, sidebar_position,
  sidebar_label, description, tags, etc.)
- Heading level conventions (e.g., `#` for page title only, `##` for
  top-level sections, `###` for subsections)
- Common section ordering patterns (e.g., Overview → Usage → Configuration
  → Troubleshooting)

**Step 1-3: Build terminology glossary**

- Collect UI element names, feature names, and technical terms used
  consistently across existing pages.
- Note the canonical form for each term (e.g., "저장" not "저장하기",
  "Dashboard" not "대시보드" — or vice versa, depending on existing pattern).
- Record bilingual term pairs if the documentation uses a mixed-language
  convention (e.g., Korean prose with English UI labels).

**Step 1-4: Identify tone and style**

- Determine the dominant speech level (e.g., 합쇼체 `~합니다`, 해요체
  `~해요`, 하십시오체 `~하십시오`).
- Identify person/voice conventions (e.g., "사용자는 ~합니다" vs
  "~하세요" imperative).
- Note active vs passive voice preference.

**Step 1-5: Identify documentation framework and catalog its conventions**

- Detect the documentation framework in use by examining configuration files
  (e.g., `docusaurus.config.js`, `.vitepress/config.*`, `mkdocs.yml`,
  `next.config.*` for Nextra, or none for plain Markdown).
- Catalog framework-specific syntax patterns found in existing documentation:
  - Admonition/callout syntax (e.g., `:::note` in Docusaurus/VitePress,
    `!!! note` in MkDocs, `> [!NOTE]` in GitHub-flavored Markdown).
  - Component patterns (e.g., `<Tabs>`/`<TabItem>` in Docusaurus,
    custom MDX components in Nextra).
  - Code block language tags and annotation conventions.
  - Custom component or shortcode usage patterns.

**Step 1-6: Compile Convention Reference**

- Produce a structured summary to use as the review baseline in Gates 2–3.
- Present the Convention Reference to the user for confirmation before
  proceeding.

---

### Gate 2 – Code-Documentation Alignment

> **ACTIVATION:** This gate runs only if code-scope files were identified in
> Gate 0. If no source code changed, skip to Gate 3.

**Step 2-1: Analyze source code changes**

- Run `git diff` on code-scope files.
- Extract changed items: API endpoints, function signatures, component props,
  configuration keys, CLI commands, environment variables.

**Step 2-2: Map code changes to documentation**

- Search across all documentation files (not just in-scope) for references to
  the changed items using filename, import path, and keyword matching.
- Build a mapping: `changed code item → documentation section(s) referencing it`.

**Step 2-3: Identify alignment gaps**

Produce an alignment report with three categories:

- **Already updated:** Documentation section was modified in this session and
  reflects the code change.
- **Needs update:** Documentation references the changed code but was NOT
  updated in this session.
- **No documentation found:** Code change has no corresponding documentation
  (flag for user decision).

Present the report to the user. "Needs update" items must be resolved before
proceeding — resolution means either updating the documentation OR the user
explicitly acknowledging that no documentation change is needed (with reason).

---

### Gate 3 – Documentation Quality Review

Apply the Convention Reference from Gate 1 to all doc-scope files.

**3a) Structural consistency**

- Heading levels follow the discovered convention.
- Frontmatter contains all expected fields with valid values.
- Section ordering matches the established pattern.
- No orphan headings (e.g., jumping from `##` to `####`).

**3b) Terminology consistency**

- Terms match the glossary from Gate 1.
- No mixed usage of the same concept (e.g., "저장" vs "저장하기", "Save"
  vs "세이브").
- Proper nouns, product names, and feature names are cased consistently.

**3c) Tone and style consistency**

- Speech level matches the discovered convention (no mixing 합쇼체 and
  해요체 within the same page).
- Person/voice is consistent (imperative vs descriptive).
- No abrupt tone shifts between sections.

**3d) Content completeness**

- No TODO, TBD, FIXME, placeholder, or Lorem ipsum markers.
- No empty sections (heading followed immediately by another heading or EOF).
- No untranslated placeholder text if the documentation is localized.

**3e) Framework-specific syntax validity**

- Admonitions/callouts properly opened and closed per the framework's syntax.
- Framework-specific components have matching open/close tags and required
  attributes (if applicable).
- Code blocks have language tags and are properly fenced.
- MDX/component imports resolve to existing components (if applicable).
- Frontmatter YAML is valid (no syntax errors, no duplicate keys).

**3f) Image and screenshot references**

> **SKIP CONDITION:** Skip if no image references (`![`, `<img`) exist
> in any doc-scope file. Verify with a quick text search before skipping.

- Every image reference (`![alt](path)` or `<img src="path">`) points to a
  file that exists in the repository.
- All images have non-empty alt text.
- No stale images (referenced file was deleted or moved).

**3g) Link validity**

- Internal document links (relative paths) resolve to existing files.
- Anchor links (`#section-name`) match actual heading slugs in the target
  document.
- No broken cross-references between documentation pages.

**3h) Sidebar and navigation alignment**

> **SKIP CONDITION:** Skip if no files were added or deleted in this
> session (only modifications). Sidebar/nav changes are only relevant
> when the file set changes.

- Identify the sidebar/navigation configuration mechanism (e.g.,
  `sidebars.js` in Docusaurus, `_meta.json` in Nextra, `nav` in
  `mkdocs.yml`, auto-generated from directory structure in VitePress).
- New documentation files added in this session are registered in the
  navigation configuration.
- Deleted documentation files are removed from the navigation configuration.
- Ordering metadata (e.g., `sidebar_position` in frontmatter, file ordering
  in config) does not conflict with other pages in the same category.

**Produce a Quality Review Report** organized by severity:

- **Error:** Must fix before commit (broken syntax, missing images, dead links).
- **Warning:** Should fix (terminology inconsistency, tone drift, missing
  alt text).
- **Info:** Optional improvement (section ordering, heading level suggestion).

---

### Gate 4 – Auto-Fix

**Step 4-1: Apply automatic fixes**

Fix items that require no judgment:

- Terminology standardization (replace variant forms with canonical term)
- Heading level corrections
- Broken relative link path repair (if the correct target is deterministic)
- Missing frontmatter field population (using Convention Reference defaults)
- Admonition/code block syntax repair
- Remove TODO/placeholder markers in completed sections

**Step 4-2: Present judgment-required items**

Items that need user input:

- Content gaps identified in Gate 2 (code-doc alignment)
- Ambiguous terminology choices (when two forms are equally common)
- Tone corrections that alter meaning
- Missing images that need creation or replacement

**Step 4-3: Summarize changes**

- Present a before/after diff summary of all auto-fixes.
- Get user confirmation before proceeding.

---

### Gate 5 – Build Verification

**Step 5-1: Run documentation build**

- Detect the build command from the project configuration (e.g.,
  `package.json` scripts, `Makefile`, or framework CLI).
- Execute the build command from the documentation project root.
- Capture full output including warnings.

**Step 5-2: Evaluate results**

- **Build succeeds with no warnings:** Proceed to Gate 6.
- **Build succeeds with warnings:** Report warnings to user. Fix if they
  relate to in-scope files; proceed if warnings are pre-existing.
- **Build fails:** Analyze error, apply fix, return to Gate 4 Step 4-1.

**Step 5-3: Record evidence**

- Build pass = final proof that documentation syntax and link references are
  valid.
- Save build exit code and relevant output lines for the commit record.

---

### Gate 6 – Commit Structuring

**Staging rule:** Stage only doc-scope files confirmed in Gate 0.
Use `git add <specific-file>` for each file individually.
Never use `git add .`, `git add -A`, or `git add --all`.

**Step 6-1: Categorize changes**

Group in-scope files by change type:

| Change Type | Commit Prefix | Description |
|---|---|---|
| Error fixes | `docs(fix):` | Broken links, syntax errors, missing images |
| Style/format | `docs(style):` | Terminology, tone, heading, frontmatter normalization |
| Content update | `docs(content):` | New sections, rewritten paragraphs, expanded explanations |
| Code-sync | `docs(sync):` | Documentation updates reflecting source code changes |

**Step 6-2: Structure commits**

- Create separate commits for each change type present.
- If a file has changes spanning multiple types, split by type where possible;
  otherwise, assign to the dominant change type.
- Ordering: `docs(fix)` → `docs(style)` → `docs(content)` → `docs(sync)`.

**Step 6-3: Write commit messages**

Use Conventional Commits format. Each message must include:

- What changed (affected pages/sections)
- Why it changed (convention alignment, code-sync, error fix)
- Scope of review (mention Convention Discovery and build verification)

---

## Guardrails

- Do not invent or fabricate documentation content not supported by the source
  code or existing documentation.
- Do not silence or bypass documentation build errors.
- Do not modify documentation tone or style without Convention Reference
  backing.
- Do not alter existing screenshots or images — only flag broken references.
- If context is insufficient to determine the correct term or phrasing, ask
  for clarification.
- Respect existing project conventions for commit messages and structure.
- **NEVER** use `git checkout -- <file>`, `git restore`, `git stash`,
  `git reset --hard`, or any other command that discards or reverts uncommitted
  changes to files outside the current session's scope.
- **NEVER** use `git add .`, `git add -A`, or `git add --all`. Always stage
  files individually with `git add <specific-file>`.
- Working tree changes from other sessions, agents, or manual edits must be
  left completely untouched.
- Convention Discovery must sample from existing documentation only — never
  use in-scope changed files as convention sources.
- Do not auto-fix items that require content judgment (ambiguous terminology,
  meaning-altering tone changes) without user approval.

---

## Failure Patterns

Common bad outputs:

- Applying conventions from only 1–2 sample files, producing biased standards
- Skipping Convention Discovery and inventing arbitrary style rules
- Ignoring code-documentation alignment when source code was also changed
- Lumping all documentation changes into a single undifferentiated commit
- Fixing terminology inconsistencies without checking which form is canonical
  in the existing corpus
- Running build verification in the wrong directory (product root instead of
  docs project root)
- Auto-fixing tone in a way that changes technical meaning
- Flagging pre-existing issues in files not modified by this session
- Reverting or discarding uncommitted changes that belong to other sessions
- Using `git add .` which accidentally stages out-of-scope changes
- Treating "ensure no unintended changes" as "revert unrelated files" instead
  of "exclude from staging"
- Reporting Convention Reference without getting user confirmation, then
  applying incorrect standards

---

## Example 1 (Minimal Context)

**Input:**

2 documentation files changed: a new "Getting Started" page was added, and an
existing "Configuration" page had a section rewritten. No source code changes.

**Output:**

1. Convention Reference: frontmatter requires `title`, `sidebar_position`,
   `description`; headings use `##` for top-level sections; tone is 합쇼체
   (`~합니다`); admonitions use `:::note` and `:::tip`
2. Code-Documentation Alignment Report: skipped (no source code changes)
3. Quality Review Findings:
   - Error: new page missing `sidebar_position` in frontmatter
   - Warning: "Configuration" page mixes "설정값" and "설정 값" (spacing)
   - Info: "Getting Started" section order differs from convention
4. Actions Taken: added `sidebar_position: 1` to frontmatter, standardized
   "설정값" (no space, matching 80% of existing usage)
5. Build Verification: `npm run build` exit 0, no warnings
6. Commit Plan: 2 commits — (a) style fix, (b) new content
7. Final Commit Messages:
   - `docs(style): standardize terminology and frontmatter in configuration page`
   - `docs(content): add getting started guide`

---

## Example 2 (Realistic Scenario)

**Input:**

8 documentation files changed across 3 categories (guides, API reference,
troubleshooting). 4 source code files also changed, including a renamed API
endpoint and a new configuration option. Sidebar configuration was not updated.

**Output:**

1. Convention Reference: frontmatter fields `title`, `sidebar_position`,
   `sidebar_label`, `description`, `tags`; 합쇼체 tone; features referenced
   with English name first then Korean in parentheses (e.g., "Dashboard
   (대시보드)"); `:::warning` for breaking changes, `:::tip` for best practices
2. Code-Documentation Alignment Report:
   - Already updated: API reference page for renamed endpoint
   - Needs update: troubleshooting page still references old endpoint name;
     configuration guide missing new `MAX_RETRY_COUNT` option
   - No documentation: new internal helper function (no user-facing docs needed)
3. Quality Review Findings:
   - Error: 2 broken internal links (target files were reorganized last sprint)
   - Error: 1 image reference to deleted screenshot (`old-dashboard.png`)
   - Warning: API reference uses "대시보드" without English name (convention
     violation)
   - Warning: new guide page uses 해요체 ("~해요") while convention is 합쇼체
   - Info: 3 pages missing `tags` frontmatter field
4. Actions Taken: fixed 2 broken links, updated old endpoint references,
   added `MAX_RETRY_COUNT` documentation, standardized bilingual term format,
   corrected speech level to 합쇼체, added missing `tags` fields, registered
   new pages in `sidebars.js`, flagged missing screenshot for user replacement
5. Build Verification: `npm run build` exit 0, 1 warning (pre-existing, out
   of scope)
6. Commit Plan: 4 commits
7. Final Commit Messages:
   - `docs(fix): repair broken links and remove stale image reference`
   - `docs(style): standardize terminology format and speech level across guides`
   - `docs(content): add MAX_RETRY_COUNT configuration documentation`
   - `docs(sync): update API reference and troubleshooting for endpoint rename`

---

## Notes

**FAST MODE** (only if explicitly requested):

- Gate 1 Convention Discovery limited to 5 most recent files
- Gate 3 performs only 3a (structural) and 3d (completeness) checks
- Gate 5 build verification skipped

**Relationship with `finalize-and-commit`:**

When both source code and documentation changed in the same session, run
`finalize-and-commit` for source code first, then `docs-finalize-and-commit`
for documentation. Gate 2 of this skill reads source code diffs but does not
modify or commit source code files.
