---
name: obs-memory
description: "Persistent Obsidian-based memory for coding agents. Use at session start to orient from a knowledge vault, during work to look up architecture/component/pattern notes, and when discoveries are made to write them back. Activate when the user mentions obsidian memory, obsidian vault, obsidian notes, or /obs commands. Provides commands: init, analyze, recap, project, note, todo, lookup, relate."
metadata:
  author: adamtylerlynch
  version: "2.2"
license: MIT
---

# Obsidian Agent Memory

You have access to a persistent Obsidian knowledge vault — a graph-structured memory that persists across sessions. Use it to orient yourself, look up architecture and component knowledge, and write back discoveries.

## Vault Discovery

Resolve the vault path using this chain (first match wins):

1. **Environment variable**: `$OBSIDIAN_VAULT_PATH`
2. **Agent config reference**: Parse the vault path from the agent's project or global config (look for "Obsidian Knowledge Vault" section with a path like `~/Documents/SomeName/`)
3. **Default**: `~/Documents/AgentMemory`

Store the resolved path as `$VAULT` for all subsequent operations. Derive `$VAULT_NAME` as `basename "$VAULT"` for CLI calls.

Verify the vault exists by checking for `$VAULT/Home.md`. If the vault doesn't exist, inform the user and suggest running the `init` command to bootstrap a new vault from the bundled template.

## Session Start — Orientation

At the start of every session, orient yourself with **at most 2 operations**:

### Step 1: Read TODOs

**CLI-first**:
```bash
obsidian vault=$VAULT_NAME tasks path="todos" todo verbose
```
**Fallback**: Read the file at `$VAULT/todos/Active TODOs.md`.

Know what's pending, in-progress, and recently completed.

### Step 2: Detect current project and read its overview

Auto-detect the project from the current working directory:
```bash
basename $(git rev-parse --show-toplevel 2>/dev/null) 2>/dev/null || basename $(pwd)
```

Then check if a matching project exists by listing files in `$VAULT/projects/*/`. Match the git repo name (or directory name) against project folder names. If a match is found, read the project overview at `$VAULT/projects/{matched-name}/{matched-name}.md`.

This project overview contains wikilinks to all components, patterns, architecture decisions, and domains. **Do not read those linked notes yet** — follow them on demand when the current task requires that context.

### What NOT to read at session start
- `Home.md` (only if you're lost and can't find the project)
- `sessions/` (only if the user references prior work)
- Domain indexes (only if you need cross-project knowledge)
- Component notes (only when working on that component)

## Automatic Behaviors

These behaviors apply to any agent using this skill. They do not require explicit commands.

### On session start

Auto-orient (TODOs + project overview) without being asked, following the Session Start procedure above. If the vault doesn't exist at the resolved path, inform the user and suggest running `init`.

### On session end signals

When the user says "done", "wrapping up", "that's it", "let's stop", or similar end-of-session language — offer to write a session summary. Don't auto-run; ask first: "Want me to write a session summary to the vault before we wrap up?"

### On component discovery

When you deeply analyze a component that has no vault note — and the project has an active vault — offer to create a component note and infer relationships from imports and dependencies. Example: "I noticed there's no vault note for the AuthMiddleware component. Want me to create one and map its dependencies?"

### On first run

When the vault doesn't exist at any resolved path, guide the user through `init`, then auto-scaffold the current project if inside a git repo.

## During Work — Graph Navigation

**Principle: Use CLI queries first, file reads second.** The Obsidian CLI provides structured access to properties, links, backlinks, tags, and search — prefer these over reading entire files.

### CLI-first lookups (preferred)

Use these CLI commands for targeted queries without consuming file-read tokens:

```bash
# Query a component's dependencies
obsidian vault=$VAULT_NAME property:read file="Component Name" name="depends-on"

# Find what depends on a component
obsidian vault=$VAULT_NAME property:read file="Component Name" name="depended-on-by"
obsidian vault=$VAULT_NAME backlinks file="Component Name"

# Find all outgoing links from a note
obsidian vault=$VAULT_NAME links file="Component Name"

# Find all notes of a type
obsidian vault=$VAULT_NAME tag verbose name="component"

# Search vault content
obsidian vault=$VAULT_NAME search format=json query="search term" matches limit=10

# Get note structure without full read
obsidian vault=$VAULT_NAME outline file="Component Name"

# Read a specific property
obsidian vault=$VAULT_NAME property:read file="Component Name" name="key-files"
```

Where `$VAULT_NAME` is the vault folder name (basename of `$VAULT`).

### File-read fallback (when CLI unavailable)

Fall back to file reads when the Obsidian CLI is not available:
- Need to understand a component? The project overview links to it. Read that one note.
- Need an architecture decision? The component note or project overview links to it. Follow the link.
- Need cross-project knowledge? Component/pattern notes link to domain notes. Follow the link.
- Need session history? Only read if you're stuck or the user references prior work.

### Frontmatter-first scanning
When you need to scan multiple notes to find the right one, read just the first ~10 lines of each file. The `tags`, `project`, `type`, and `status` fields in the frontmatter tell you if the note is relevant before reading the full body.

### Directory listing before reading
List directory contents before reading files — know what exists without consuming tokens:
- `$VAULT/projects/{name}/**/*.md` — all notes for a project
- `$VAULT/domains/{tech}/*.md` — domain knowledge files

## Writing to the Vault

Write concisely. Notes are for your future context, not human documentation. Prefer:
- Bullet points over prose
- Wikilinks over repeated explanations (link to it, don't re-state it)
- Frontmatter tags for discoverability over verbose descriptions

### When to write
- **New component discovered**: Create a component note when you deeply understand a part of the codebase
- **Architecture decision made**: Record ADRs when significant design choices are made
- **Pattern identified**: Document recurring patterns that future sessions should follow
- **Domain knowledge learned**: Write to domain notes when you discover cross-project knowledge

### Scoping rules
| Knowledge type | Location | Example |
|---|---|---|
| One project only | `projects/{name}/` | How this API handles auth |
| Shared across projects | `domains/{tech}/` | How Go interfaces work |
| Universal, tech-agnostic | `patterns/` | SOLID principles |
| Session summaries | `sessions/` | What was done and discovered |
| TODOs | `todos/Active TODOs.md` | Grouped by project |

### Frontmatter conventions
Always include in new notes:
```yaml
---
tags: [category, project/short-name]
type: <component|adr|session|project>
project: "[[projects/{name}/{name}]]"
created: YYYY-MM-DD
---
```

### Wikilink conventions
- Link to related notes: `[[projects/{name}/components/Component Name|Component Name]]`
- Link to domains: `[[domains/{tech}/{Tech Name}|Tech Name]]`
- Link back to project: `[[projects/{name}/{name}|project-name]]`

### Note templates

**Component Note:**
```yaml
---
tags: [components, project/{short-name}]
type: component
project: "[[projects/{name}/{name}]]"
created: {date}
status: active
layer: ""
depends-on: []
depended-on-by: []
key-files: []
---
```
Sections: Purpose, Gotchas

**Architecture Decision:**
```yaml
---
tags: [architecture, decision, project/{short-name}]
type: adr
project: "[[projects/{name}/{name}]]"
status: proposed | accepted | superseded
created: {date}
---
```
Sections: Context, Decision, Alternatives Considered, Consequences

**Session Note:**
```yaml
---
tags: [sessions]
type: session
projects:
  - "[[projects/{name}/{name}]]"
created: {date}
branch: {branch-name}
---
```
Sections: Context, Work Done, Discoveries, Decisions, Next Steps

## Commands

### `init` — Initialize the Vault

Bootstrap a new Obsidian Agent Memory vault from the bundled template.

**Usage**: `init [path]`

#### Steps:

1. **Determine vault path**: Use the first argument if provided, otherwise use the vault resolution chain (default: `~/Documents/AgentMemory`).

2. **Check if vault already exists**: Look for `$VAULT/Home.md`. If it exists, tell the user the vault already exists at that path and offer to open it.

3. **Locate the bundled template**: The template is at `vault-template/` relative to the skill package root. Search for the skill package installation directory — it may be in the agent's plugin/skill cache or a local checkout. Look for the `vault-template/Home.md` file to confirm the correct path.

4. **Create the vault**:
   ```bash
   mkdir -p "$VAULT"
   cp -r "$TEMPLATE_DIR/vault-template/"* "$VAULT/"
   ```

5. **Create Obsidian config directory**:
   ```bash
   mkdir -p "$VAULT/.obsidian"
   ```
   Write the following to `$VAULT/.obsidian/app.json`:
   ```json
   {
     "alwaysUpdateLinks": true,
     "newFileLocation": "folder",
     "newFileFolderPath": "inbox",
     "attachmentFolderPath": "attachments"
   }
   ```

6. **Create empty directories**:
   ```bash
   mkdir -p "$VAULT/inbox"
   mkdir -p "$VAULT/attachments"
   ```
   Create `.gitkeep` files in each empty directory.

7. **Report** the created vault and provide next steps:
   - Open in Obsidian: Vault Switcher → Open folder as vault → `$VAULT`
   - Set the vault path via `OBSIDIAN_VAULT_PATH` environment variable or agent config
   - Start working — the agent will build the knowledge graph as it goes

8. **Generate agent config snippet**: Output a vault path snippet appropriate for the user's agent. For Claude Code, output a `CLAUDE.md` snippet:
   ```markdown
   ## Obsidian Knowledge Vault
   Persistent knowledge vault at `$VAULT`.
   ```
   For other agents, output a generic instruction: "Add `OBSIDIAN_VAULT_PATH=$VAULT` to your environment or agent config."

9. **Auto-scaffold current project**: If inside a git repo, automatically run the `project` command to scaffold the current project in the vault.

10. **Concise output**: Keep the final output to 5-8 lines max: vault path created, project scaffolded (if applicable), how to open in Obsidian, how to set the vault path.

### `analyze` — Analyze Project & Hydrate Vault

Analyze the current codebase and populate the vault with interconnected, content-rich notes.

**Usage**: `analyze` (no arguments — uses current repo)

#### Phase 1: Discovery — Scan for Knowledge Sources

Scan the repo for files that contain pre-existing knowledge:

| Category | Files to scan |
|---|---|
| Agent configs | `CLAUDE.md`, `.claude/CLAUDE.md`, `.cursorrules`, `.windsurfrules`, `.clinerules`, `AGENTS.md`, `Agents.md` |
| Documentation | `README.md`, `CONTRIBUTING.md`, `ARCHITECTURE.md`, `docs/architecture.md`, `docs/ARCHITECTURE.md` |
| Existing ADRs | `docs/adr/ADR-*.md`, `architecture/ADR-*.md`, `adr/*.md`, `docs/decisions/*.md` |
| Project metadata | `package.json`, `go.mod`, `Cargo.toml`, `pyproject.toml`, `setup.py`, `Gemfile`, `pom.xml`, `build.gradle`, `*.csproj` |
| Build/CI | `Makefile`, `Dockerfile`, `docker-compose.yml`, `.github/workflows/*.yml`, `.gitlab-ci.yml` |
| Config | `tsconfig.json`, `.eslintrc.*`, `jest.config.*`, `.goreleaser.yml` |

Read each discovered file. For large files (README, agent configs), read fully. For metadata files, extract key fields (name, version, dependencies).

Also gather:
- Repo URL from `git remote get-url origin`
- Repo root path from `git rev-parse --show-toplevel`
- Active branch from `git branch --show-current`
- Directory tree (top 2 levels of source directories, excluding hidden/vendor/node_modules)
- File extension frequency (for language detection)

#### Phase 2: Analysis — Extract & Synthesize

Using the discovered content, synthesize:

1. **Project metadata**: name, language(s), framework(s), repo URL, local path
2. **Architecture summary**: Entry points, layer organization (e.g., `internal/` → Go service layers, `src/components/` → React app), build system
3. **Component inventory**: Major functional modules — each top-level source directory or logical grouping that represents a distinct unit. For each: purpose (from README/agent config context), key files, and relationships
4. **Pattern inventory**: Coding conventions, error handling strategies, testing approaches — extracted from agent config files (CLAUDE.md sections like "Coding Guidelines", "Testing", etc.)
5. **Domain mapping**: Detected technologies → vault domain notes (e.g., Go, TypeScript, Terraform, React)
6. **Existing decisions**: ADR files found in the repo → import as vault ADR notes
7. **Dependency summary**: Key dependencies from package manifests (listed in project overview, not separate notes)

#### Phase 3: Hydration — Write Vault Notes

**Idempotency rules:**
- If project directory doesn't exist → create everything (scaffold + populate)
- If project directory exists but overview is a skeleton → **replace** overview with populated version
- If individual component/pattern/ADR notes already exist → **skip** and report (don't overwrite manual work)
- Domain notes: create if missing, **append** project link if existing

**Notes to write:**

1. **Project overview** (`$VAULT/projects/{name}/{name}.md`) — Fully populated:
   ```yaml
   ---
   aliases: []
   tags: [project/{short-name}]
   type: project
   repo: {git remote url}
   path: {repo root path}
   language: {detected language(s)}
   framework: {detected framework(s)}
   created: {YYYY-MM-DD}
   status: active
   ---
   ```
   Sections:
   - **Architecture**: Real description from analysis
   - **Components**: Table with wikilinks to component notes
   - **Project Patterns**: Table with wikilinks to pattern notes
   - **Architecture Decisions**: List with wikilinks to ADR notes
   - **Key Dependencies**: From package manifests
   - **Domains**: Wikilinks to domain notes

2. **Component notes** (`$VAULT/projects/{name}/components/{Component}.md`) — One per major module:
   ```yaml
   ---
   tags: [components, project/{short-name}]
   type: component
   project: "[[projects/{name}/{name}]]"
   created: {YYYY-MM-DD}
   status: active
   layer: {detected layer}
   depends-on: []
   depended-on-by: []
   key-files: [{key files list}]
   ---
   ```
   Sections: Purpose, Gotchas

3. **Pattern notes** (`$VAULT/projects/{name}/patterns/{Pattern}.md`) — From agent config conventions:
   ```yaml
   ---
   tags: [patterns, project/{short-name}]
   type: pattern
   project: "[[projects/{name}/{name}]]"
   created: {YYYY-MM-DD}
   ---
   ```
   Sections: Pattern, When to Use, Implementation

4. **ADR imports** (`$VAULT/projects/{name}/architecture/ADR-{NNNN} {title}.md`) — From existing repo ADRs:
   ```yaml
   ---
   tags: [architecture, decision, project/{short-name}]
   type: adr
   project: "[[projects/{name}/{name}]]"
   status: accepted
   created: {YYYY-MM-DD}
   ---
   ```
   Preserve original content, add vault frontmatter.

5. **Domain notes** (`$VAULT/domains/{tech}/{Tech}.md`):
   - If new: create with project link
   - If existing: add this project to "Projects Using This Domain" section

6. **Index updates**:
   - `$VAULT/projects/Projects.md` — add/update row
   - `$VAULT/domains/Domains.md` — add/update rows for new domains

#### Phase 4: Report

Print a summary:
```
Analyzed: {project-name}
  Sources read: {N} knowledge files
  Created: project overview (populated)
  Created: {N} component notes
  Created: {N} pattern notes
  Imported: {N} architecture decisions
  Linked: {N} domain notes
  Skipped: {N} existing notes (preserved)
```

### `recap` — Write Session Summary

Write a session summary note and update TODOs.

**Usage**: `recap`

#### Steps:

1. **Gather session context** by running:
   ```bash
   git log --oneline -20
   git diff --stat HEAD~5..HEAD 2>/dev/null || git diff --stat
   git branch --show-current
   ```

2. **Read current TODOs** — CLI-first:
   ```bash
   obsidian vault=$VAULT_NAME tasks path="todos" todo verbose
   ```
   Fallback: Read `$VAULT/todos/Active TODOs.md`.

3. **Read project overview** from `$VAULT/projects/$PROJECT/$PROJECT.md` (for wikilinks and context).

4. **Write session note** — CLI-first:
   ```bash
   obsidian vault=$VAULT_NAME create path="sessions/{YYYY-MM-DD} - {title}" template="Session Note" silent
   obsidian vault=$VAULT_NAME property:set path="sessions/{YYYY-MM-DD} - {title}" name="type" value="session" type="text"
   obsidian vault=$VAULT_NAME property:set path="sessions/{YYYY-MM-DD} - {title}" name="branch" value="{current-branch}" type="text"
   obsidian vault=$VAULT_NAME property:set path="sessions/{YYYY-MM-DD} - {title}" name="projects" value="[[projects/$PROJECT/$PROJECT]]" type="list"
   ```
   Then append body content:
   ```bash
   obsidian vault=$VAULT_NAME append path="sessions/{YYYY-MM-DD} - {title}" content="..."
   ```
   Fallback: Write the file directly at `$VAULT/sessions/{YYYY-MM-DD} - {title}.md`:
   ```yaml
   ---
   tags: [sessions]
   type: session
   projects:
     - "[[projects/$PROJECT/$PROJECT]]"
   created: {YYYY-MM-DD}
   branch: {current-branch}
   ---
   ```
   Sections to fill:
   - **Context**: What was being worked on (from git log context)
   - **Work Done**: Numbered list of accomplishments (from commits and diffs)
   - **Discoveries**: Technical findings worth remembering
   - **Decisions**: Design choices made during this session
   - **Next Steps**: What should happen next (checkboxes)

5. **Update TODOs**: Edit `$VAULT/todos/Active TODOs.md`:
   - Remove completed `[x]` items from Active TODOs — append them to `$VAULT/todos/Completed TODOs Archive.md` under a dated `## $PROJECT (YYYY-MM-DD)` heading (create the file if it doesn't exist)
   - Add new items discovered during the session
   - Keep items grouped by project
   - **Never leave `[x]` items in Active TODOs** — they accumulate over time and waste context window on every session start

6. **Update Session Log**: Add an entry to `$VAULT/sessions/Session Log.md` with the date, project, branch, and a one-line summary.

7. **Report** what was written.

### `project` — Scaffold New Project

Scaffold a new project in the vault. Uses the first argument as the project name, or defaults to `$PROJECT`.

**Usage**: `project [name]`

#### Steps:

1. **Determine project name**: Use the argument if provided, otherwise use `$PROJECT`.

2. **Check if project exists**: Look for `$VAULT/projects/{name}/{name}.md`. If it exists, tell the user and offer to open it instead.

3. **Create directory structure**:
   - `$VAULT/projects/{name}/`
   - `$VAULT/projects/{name}/architecture/`
   - `$VAULT/projects/{name}/components/`
   - `$VAULT/projects/{name}/patterns/`

4. **Create project overview** at `$VAULT/projects/{name}/{name}.md`:
   ```yaml
   ---
   aliases: []
   tags: [project/{short-name}]
   type: project
   repo: {git remote url if available}
   path: {working directory}
   language: {detected from files}
   framework:
   created: {YYYY-MM-DD}
   status: active
   ---
   ```
   Sections: Architecture, Components, Project Patterns, Architecture Decisions, Domains

   Auto-detect and fill:
   - Language from file extensions in the repo
   - Repo URL from `git remote get-url origin`
   - Link to relevant domains that exist in `$VAULT/domains/`

5. **Update Projects.md**: Add a row to the project table in `$VAULT/projects/Projects.md`.

6. **Report** the scaffolded structure.

### `note` — Create a Note from Template

Create a note using a template. The first argument specifies the type: `component`, `adr`, or `pattern`.

**Usage**: `note <component|adr|pattern> [name]`

#### `note component [name]`

Create at `$VAULT/projects/$PROJECT/components/{name}.md`:
```yaml
---
tags: [components, project/{short-name}]
type: component
project: "[[projects/$PROJECT/$PROJECT]]"
created: {YYYY-MM-DD}
status: active
layer: ""
depends-on: []
depended-on-by: []
key-files: []
---
```
Sections: Purpose, Gotchas

If a name argument is provided, use it as the component name. Otherwise, ask the user.

#### `note adr [title]`

Determine the next ADR number by listing existing ADRs in `$VAULT/projects/$PROJECT/architecture/ADR-*.md`.

Create at `$VAULT/projects/$PROJECT/architecture/ADR-{NNNN} {title}.md`:
```yaml
---
tags: [architecture, decision, project/{short-name}]
type: adr
project: "[[projects/$PROJECT/$PROJECT]]"
status: proposed
created: {YYYY-MM-DD}
---
```
Sections: Context, Decision, Alternatives Considered, Consequences

#### `note pattern [name]`

Create at `$VAULT/projects/$PROJECT/patterns/{name}.md`:
```yaml
---
tags: [patterns, project/{short-name}]
project: "[[projects/$PROJECT/$PROJECT]]"
created: {YYYY-MM-DD}
---
```
Sections: Pattern, When to Use, Implementation, Examples

After creating any note, add a wikilink to it from the project overview.

### `todo` — Manage TODOs

View and update the Active TODOs for the current project.

**Usage**: `todo [action]`

#### Steps:

1. **Read current TODOs** from `$VAULT/todos/Active TODOs.md`.

2. **If no additional arguments**: Display the current TODOs for `$PROJECT` and ask what to update.

3. **If arguments provided**: Parse as a TODO action:
   - Plain text → Add as a new pending item under `$PROJECT`
   - `done: <text>` → Mark item done: remove from Active TODOs, append to `$VAULT/todos/Completed TODOs Archive.md` under a dated `## $PROJECT (YYYY-MM-DD)` heading (create the file if it doesn't exist)
   - `remove: <text>` → Remove matching item

4. **Write back** Active TODOs (and archive file if items were completed).

### `lookup` — Search the Vault

Search the vault for knowledge. Supports targeted subcommands and freetext search.

**Usage**: `lookup <subcommand|freetext>`

#### `lookup deps <name>`

Query what a component depends on.

```bash
obsidian vault=$VAULT_NAME property:read file="<name>" name="depends-on"
```
Fallback: Read the component note and parse the `depends-on` frontmatter list.

#### `lookup consumers <name>`

Query what depends on a component (reverse dependencies).

```bash
obsidian vault=$VAULT_NAME property:read file="<name>" name="depended-on-by"
obsidian vault=$VAULT_NAME backlinks file="<name>"
```
Combine results — `depended-on-by` gives explicit relationships, `backlinks` catches implicit references. Fallback: Read the component note and search for backlinks via Grep.

#### `lookup related <name>`

Query all notes connected to a given note (both directions).

```bash
obsidian vault=$VAULT_NAME links file="<name>"
obsidian vault=$VAULT_NAME backlinks file="<name>"
```
Fallback: Read the note and extract wikilinks, then Grep for `[[<name>` across the vault.

#### `lookup type <type> [project]`

Find all notes of a given type (component, adr, session, project).

```bash
obsidian vault=$VAULT_NAME tag verbose name="<type>"
```
If `[project]` is specified, filter results to notes also tagged `project/<short-name>`:
```bash
obsidian vault=$VAULT_NAME search query="type: <type>" path="projects/<project>"
```
Fallback: Grep for `type: <type>` across `$VAULT`.

#### `lookup layer <layer> [project]`

Find all components in a specific layer.

```bash
obsidian vault=$VAULT_NAME search query="layer: <layer>" path="projects/<project>"
```
If no project specified, search across all projects:
```bash
obsidian vault=$VAULT_NAME search query="layer: <layer>" path="projects"
```
Fallback: Grep for `layer: <layer>` across `$VAULT/projects/`.

#### `lookup files <component>`

Query key files for a component.

```bash
obsidian vault=$VAULT_NAME property:read file="<component>" name="key-files"
```
Fallback: Read the component note and parse the `key-files` frontmatter list.

#### `lookup <freetext>`

General search across the vault.

```bash
obsidian vault=$VAULT_NAME search format=json query="<freetext>" matches limit=10
```
Fallback: Search file contents for the query across all `.md` files in `$VAULT`.

If the query looks like a tag (starts with `#` or `project/`):
```bash
obsidian vault=$VAULT_NAME tags name="<query>"
```

If the query matches a note name:
```bash
obsidian vault=$VAULT_NAME backlinks file="<query>"
```

**Present results**: Show matching notes with their frontmatter (first ~10 lines) so the user can decide which to read in full.

### `relate` — Manage Relationships

Create and query bidirectional relationships between notes via frontmatter properties.

**Usage**: `relate <subcommand> [args]`

#### Supported relationship types

| Forward property | Inverse property |
|---|---|
| `depends-on` | `depended-on-by` |
| `extends` | `extended-by` |
| `implements` | `implemented-by` |
| `consumes` | `consumed-by` |

#### `relate <source> <target> [type]`

Create a bidirectional relationship between two notes. Default type is `depends-on`/`depended-on-by`.

##### Steps:

1. **Resolve note names**: Use `file=` parameter for note display names. If ambiguity is possible (same name, different folders), use `path=` with full vault-relative path.

2. **Read current property on source** (forward direction):
   ```bash
   obsidian vault=$VAULT_NAME property:read file="<source>" name="<forward-property>"
   ```
   Fallback: Read the source note frontmatter.

3. **Check if relationship already exists**: If `<target>` (as a wikilink) is already in the list, skip and report "already related".

4. **Append to source** (forward direction):
   Build the new list locally by appending `[[<target>]]` to the current values, then set:
   ```bash
   obsidian vault=$VAULT_NAME property:set file="<source>" name="<forward-property>" value="<full-list>" type="list"
   ```
   Fallback: Edit the source note's frontmatter directly.

5. **Read current property on target** (inverse direction):
   ```bash
   obsidian vault=$VAULT_NAME property:read file="<target>" name="<inverse-property>"
   ```

6. **Append to target** (inverse direction):
   ```bash
   obsidian vault=$VAULT_NAME property:set file="<target>" name="<inverse-property>" value="<full-list>" type="list"
   ```

7. **Report** the created relationship.

**Safety**: Always read-then-set. Never blind-append. The full list is constructed locally and set atomically.

#### `relate show <name>`

Display all relationships for a note.

##### Steps:

1. **Query all 8 relationship properties**:
   ```bash
   obsidian vault=$VAULT_NAME property:read file="<name>" name="depends-on"
   obsidian vault=$VAULT_NAME property:read file="<name>" name="depended-on-by"
   obsidian vault=$VAULT_NAME property:read file="<name>" name="extends"
   obsidian vault=$VAULT_NAME property:read file="<name>" name="extended-by"
   obsidian vault=$VAULT_NAME property:read file="<name>" name="implements"
   obsidian vault=$VAULT_NAME property:read file="<name>" name="implemented-by"
   obsidian vault=$VAULT_NAME property:read file="<name>" name="consumes"
   obsidian vault=$VAULT_NAME property:read file="<name>" name="consumed-by"
   ```
   Fallback: Read the note frontmatter and parse all relationship properties.

2. **Query structural links**:
   ```bash
   obsidian vault=$VAULT_NAME links file="<name>"
   obsidian vault=$VAULT_NAME backlinks file="<name>"
   ```

3. **Present results** grouped by relationship type. Show explicit (property) relationships first, then structural (wikilink) relationships that aren't already covered.

#### `relate tree <name> [depth]`

Walk the dependency tree via BFS. Default depth is 2.

##### Steps:

1. **Initialize BFS**: Start with `<name>` at depth 0. Maintain a visited set and a queue.

2. **For each node in the queue**:
   ```bash
   obsidian vault=$VAULT_NAME property:read file="<current>" name="depends-on"
   ```
   Fallback: Read the note and parse `depends-on` from frontmatter.

3. **Add unvisited dependencies** to the queue at `current_depth + 1`. Stop when `depth` limit is reached.

4. **Present** the tree as an indented list showing the dependency chain.

## Token Budget Rules

1. **CLI over reads**: Use `obsidian` CLI for property reads, backlinks, links, tags, and search — these return targeted data without full file reads
2. **Session start**: At most 2 operations (TODOs + project overview)
3. **During work**: Use `lookup` subcommands and `relate show` before reading full notes
4. **Frontmatter first**: When scanning, read ~10 lines before committing to full read
5. **List before read**: List directory contents before reading files
6. **Write concisely**: Bullet points, links, tags — no prose when bullets suffice

## Error Handling

- If the vault doesn't exist → suggest running `/obs init` to bootstrap it
- If the project doesn't exist in the vault → offer to run `/obs project` to scaffold it
- If a note already exists → show it instead of overwriting, offer to edit
- If no git repo is detected → use current directory name as project name
- If CLI command fails → fall back to file read for the same data

## Vault Structure Reference
```
$VAULT/
├── Home.md                           # Dashboard (read only if lost)
├── projects/{name}/
│   ├── {name}.md                     # Project overview — START HERE
│   ├── architecture/                 # ADRs and design decisions
│   ├── components/                   # Per-component notes
│   └── patterns/                     # Project-specific patterns
├── domains/{tech}/                   # Cross-project knowledge
├── patterns/                         # Universal patterns
├── sessions/                         # Session logs (read only when needed)
├── todos/Active TODOs.md             # Pending work (read at session start)
├── templates/                        # Note templates
└── inbox/                            # Unsorted
```
