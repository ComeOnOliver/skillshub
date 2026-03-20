# Skill writing guide

## What is a skill

A skill is a folder containing a `SKILL.md` file that gives an AI agent specialized knowledge, workflows, or tools for a specific task. Skills are part of an open standard adopted by 30+ agent products including Claude Code, OpenAI Codex, Cursor, Gemini CLI, VS Code Copilot, GitHub Copilot, Junie, Goose, Roo Code, and others.

The standard is maintained at [agentskills.io](https://agentskills.io/) with the source at [github.com/agentskills/agentskills](https://github.com/agentskills/agentskills).

Skills solve the problem that agents lack procedural knowledge and domain-specific context. A skill packages that knowledge in a portable, version-controlled format that works across multiple agent products.

## Directory structure

Minimum viable skill:

```
skill-name/
+-- SKILL.md          # Required: metadata + instructions
```

Full structure:

```
skill-name/
+-- SKILL.md          # Required: metadata + instructions
+-- scripts/          # Optional: executable code (Python, Bash, etc.)
+-- references/       # Optional: documentation loaded on demand
+-- assets/           # Optional: templates, images, data files
+-- agents/
|   +-- openai.yaml   # Optional: UI metadata for skill lists
```

- `scripts/` holds deterministic code the agent can execute without loading into context.
- `references/` holds documentation the agent reads when needed. Keep files focused and one level deep from SKILL.md.
- `assets/` holds static resources used in output (templates, images, fonts). Not loaded into context.
- `agents/openai.yaml` provides UI-facing metadata for platforms that display skill lists.

## SKILL.md format

Every SKILL.md has two parts: YAML frontmatter and a Markdown body.

### Frontmatter

```yaml
---
name: skill-name
description: What the skill does and when to use it.
---
```

Required fields:

| Field | Required | Constraints |
| --- | --- | --- |
| `name` | Yes | Max 64 chars. Lowercase letters, numbers, hyphens only. No leading/trailing/consecutive hyphens. Must match directory name. |
| `description` | Yes | Max 1024 chars. Non-empty. Describes what and when. |

Optional fields:

| Field | Required | Constraints |
| --- | --- | --- |
| `license` | No | License name or reference to bundled license file. |
| `compatibility` | No | Max 500 chars. Environment requirements (product, packages, network). |
| `metadata` | No | Arbitrary key-value map for additional properties. |
| `allowed-tools` | No | Space-delimited list of pre-approved tools. Experimental. |

### Body

The Markdown body after frontmatter contains the instructions the agent follows after activation. There are no format restrictions. Write whatever helps agents perform the task.

Recommended sections:

- Step-by-step workflow
- Examples of inputs and outputs
- Common edge cases and error handling
- References to bundled files with clear guidance on when to read them

## Writing a good description

The description is the trigger mechanism. Agents load only name and description at startup for all installed skills, then activate the full SKILL.md when a task matches. A poor description means the skill never triggers.

Rules:

- Include both what the skill does and when to use it.
- Include specific keywords that help agents match tasks.
- Put all trigger information in the description, not in the body. The body only loads after activation.
- Stay under 1024 characters.

Good:

```yaml
description: "Extract text and tables from PDF files, fill PDF forms, and merge multiple PDFs. Use when working with PDF documents or when the user mentions PDFs, forms, or document extraction."
```

Poor:

```yaml
description: "Helps with PDFs."
```

Good (from this repo):

```yaml
description: "Comprehensive Python code review focused on bugs, correctness, security, maintainability, and actionable fixes. Use when a user asks for a review of Python files, wants severity-rated findings, wants before/after fix suggestions, or wants verification that implementation matches an active plan document (if one exists)."
```

## Progressive disclosure

Skills use three-level loading to manage context efficiently:

1. **Metadata** (~100 tokens): The `name` and `description` fields load at startup for all skills.
2. **Instructions** (< 5000 tokens recommended): The full SKILL.md body loads when the skill activates.
3. **Resources** (as needed): Files in `scripts/`, `references/`, and `assets/` load only when required.

Key guidelines:

- Keep SKILL.md body under 500 lines.
- Move detailed reference material to separate files in `references/`.
- Reference those files from SKILL.md with clear guidance on when to read them.
- For large reference files (100+ lines), include a table of contents at the top.
- For very large files (10k+ words), include grep search patterns in SKILL.md.
- Keep file references one level deep. Avoid deeply nested reference chains.

## Bundled resources

### When to use scripts/

Use when the same code would be rewritten repeatedly or deterministic reliability is needed. Scripts are token-efficient because agents can execute them without loading into context.

### When to use references/

Use for documentation the agent should consult while working: schemas, API docs, domain knowledge, policies, workflow guides. Keeps SKILL.md lean while making information discoverable. Information should live in either SKILL.md or references, not both.

### When to use assets/

Use for files that appear in the output: templates, images, icons, fonts, boilerplate code. These are not loaded into context but copied or modified during execution.

## agents/openai.yaml

Provides UI metadata for platforms that show skill lists. Minimal example:

```yaml
interface:
  display_name: "Skill Writing Guide"
  short_description: "Author and improve Agent Skills"
  default_prompt: "Help me create or improve an Agent Skill following the open standard."
```

Fields:

- `display_name`: Human-readable name shown in UI.
- `short_description`: One-line summary for skill lists.
- `default_prompt`: Suggested prompt when the user selects the skill.

Only include optional fields (icons, brand_color) if explicitly provided.

## Repo-specific conventions

Skills in this repository follow additional patterns observed across existing skills:

- **Workflow section**: Most skills define a numbered workflow the agent follows step by step.
- **Output contract**: Skills like `python-code-review` define a structured output format (severity levels, required sections).
- **Quality bar section**: Planning skills define explicit quality standards and anti-patterns.
- **Reference files**: Complex skills use `references/` for definitions, capacity/sizing, naming guardrails, and quality standards.
- **Conditional paths**: Skills check for optional repo infrastructure (e.g., `docs/active_plans/`) and skip steps when absent.
- Follow [docs/MARKDOWN_STYLE.md](docs/MARKDOWN_STYLE.md): sentence-case headings, ASCII only, `-` for bullets.
- Follow [docs/REPO_STYLE.md](docs/REPO_STYLE.md): lowercase filenames with underscores in references, SCREAMING_SNAKE_CASE for Markdown docs.

## Skill naming

Rules from the spec:

- Lowercase letters, digits, and hyphens only.
- Max 64 characters.
- No leading, trailing, or consecutive hyphens.
- Must match the parent directory name exactly.
- Prefer short, verb-led phrases (e.g., `python-code-review`, `arch-docs`).
- Namespace by tool when it improves clarity (e.g., `gh-address-comments`).

## What not to include

A skill folder should contain only files that directly support the agent's task. Do not create:

- `README.md`
- `CHANGELOG.md`
- `INSTALLATION_GUIDE.md`
- `QUICK_REFERENCE.md`
- User-facing documentation
- Setup or testing procedures

The skill is for agents, not humans. Auxiliary context about the creation process does not belong in the skill folder.

Exception: `references/` files that the agent reads on demand are appropriate.

## Checklist

Before shipping a skill, verify:

- [ ] `SKILL.md` exists with valid YAML frontmatter.
- [ ] `name` field matches directory name exactly.
- [ ] `name` is lowercase, hyphens only, max 64 chars, no leading/trailing/consecutive hyphens.
- [ ] `description` is non-empty, under 1024 characters, includes what and when.
- [ ] SKILL.md body is under 500 lines.
- [ ] All referenced files exist and paths are relative from SKILL.md.
- [ ] File references are one level deep (no nested chains).
- [ ] Large reference files have a table of contents.
- [ ] No duplicate information between SKILL.md and reference files.
- [ ] No auxiliary docs (README, CHANGELOG) in the skill folder.
- [ ] `agents/openai.yaml` is present with display_name, short_description, default_prompt.
- [ ] ASCII-only content (no UTF-8 symbols outside escape sequences).

## Further reading

- Specification: [agentskills.io/specification](https://agentskills.io/specification)
- What are skills: [agentskills.io/what-are-skills](https://agentskills.io/what-are-skills)
- Quick reference: [references/SPEC_QUICK_REFERENCE.md](references/SPEC_QUICK_REFERENCE.md)