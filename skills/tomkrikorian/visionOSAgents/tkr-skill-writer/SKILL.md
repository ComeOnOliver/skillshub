# TKR Skill Writer

## Description and Goals

This skill provides guidelines and templates for creating well-structured skills that follow consistent patterns in this repository while staying aligned with the current Codex skill guide. Skills should be clear, discoverable, and provide actionable guidance for developers.

### Goals

- Standardize skill structure across all skills in the repository
- Ensure skills are discoverable and easy to navigate
- Provide clear "when to use" guidance for each skill
- Maintain consistent reference file organization
- Keep repo conventions separate from actual Codex requirements
- Include optional Codex metadata when it improves discovery and presentation
- Enable efficient skill creation and maintenance

## What This Skill Should Do

When creating or updating a skill, this skill guides you to:

1. **Start from the official minimum**:
   - A skill folder with a `SKILL.md` file
   - Frontmatter with `name` and `description`
   - Instructions that explain exactly when the skill should trigger

2. **Apply this repo's preferred structure**:
   - Description and Goals
   - What This Skill Should Do
   - Information About the Skill (with subcategories)

3. **Create reference files** that are:
   - One level deep from SKILL.md (e.g., `references/filename.md`)
   - Use relative paths from the skill root
   - Avoid deeply nested reference chains

4. **Organize component/system references** in tables with:
   - Component/System name as a clickable link: `[ComponentName](references/componentname.md)`
   - "When to Use" descriptions that clearly explain when to load each reference

5. **Add optional metadata when useful**:
   - Create `agents/openai.yaml` for UI metadata in the Codex app
   - Set `interface.display_name`, `short_description`, `icon_small`, `icon_large`, and `brand_color`
   - Add `interface.default_prompt` only when a starter prompt will improve skill discoverability or invocation clarity
   - Add `policy` or `dependencies` only when the skill genuinely needs them

6. **Follow consistent formatting**:
   - Use markdown links for file references
   - Keep tables readable and scannable
   - Provide clear, actionable descriptions

## Information About the Skill

### Skill Structure Template

Every `SKILL.md` must satisfy the official minimum format. In this repo, the preferred structure is the three-section layout below:

```text
skill-name/
├── SKILL.md
├── agents/
│   └── openai.yaml
├── assets/
│   └── logo.svg
└── references/
    └── reference.md
```

```markdown
---
name: skill-name
description: Brief description of what the skill does and when to use it.
---

# Skill Name

## Description and Goals

[Description of the skill, its purpose, and goals]

### Goals

- Goal 1
- Goal 2
- Goal 3

## What This Skill Should Do

[Clear explanation of what the skill accomplishes and how it should be used]

## Information About the Skill

### Core Concepts

[Important concepts and principles]

### Reference Tables

[Tables organizing references with clickable links and "When to Use" descriptions]

### Implementation Patterns

[Code examples and patterns]

### Pitfalls and Checks

[Common mistakes and things to watch for]
```

### File Reference Guidelines

- **Use relative paths** from the skill root directory
- **Keep references one level deep**: `references/filename.md`
- **Avoid nested chains**: Don't create references that point to other references that point to more references
- **Use markdown links**: `[ComponentName](references/componentname.md)`

### Optional Metadata

Codex supports optional skill metadata in `agents/openai.yaml`. Use it when the skill benefits from a polished display name, icon, short description, brand color, invocation policy, or declared tool dependencies.

```yaml
interface:
  display_name: "Optional user-facing name"
  short_description: "Optional user-facing description"
  icon_small: "../assets/small-logo.svg"
  icon_large: "../assets/large-logo.png"
  brand_color: "#3B82F6"
  default_prompt: "Optional surrounding prompt to use the skill with"

policy:
  allow_implicit_invocation: false

dependencies:
  tools:
    - type: "mcp"
      value: "openaiDeveloperDocs"
      description: "OpenAI Docs MCP server"
      transport: "streamable_http"
      url: "https://developers.openai.com/mcp"
```

Use `policy` and `dependencies` only when they materially improve the skill. Do not add them by default just because the fields exist.

### Table Format

Reference tables should use this format:

```markdown
| Component | When to Use |
|-----------|-------------|
| [`ComponentName`](references/componentname.md) | Clear description of when to use this component. |
```

### Reference File Naming

- Component files: `{name}component.md` (e.g., `modelcomponent.md`)
- System files: `system.md` (consolidate all system info in one file)
- Other references: Use descriptive, lowercase names with hyphens

### Best Practices

- Keep "When to Use" descriptions concise but informative
- Group related components/systems into logical categories
- Provide code examples in implementation patterns sections
- Document common pitfalls and how to avoid them
- Update the skill description in the frontmatter to match the content
- Keep each skill focused on one job
- Prefer instructions over scripts unless deterministic tooling is required
- Write imperative steps with explicit inputs and outputs
- Test prompts against the skill description to confirm the trigger behavior is correct
- Use `$skill-creator` first when you want a starting point from the official Codex workflow
- Treat repo-specific layout rules as conventions, not as requirements imposed by Codex itself